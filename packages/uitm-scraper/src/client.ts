import { parse } from "node-html-parser";
import { CookieJar } from "tough-cookie";
import {
	DAY_MAP_ICRESS,
	DAY_MAP_MYSTUDENT,
	fetchIcress,
	fetchScrapsFromRootPage,
	formatClock,
	parseTimeIcress,
	parseTimeMyStudent,
} from "./scraper";
import type {
	Campus,
	Course,
	Group,
	MyStudentAPIResponse,
	ScraperConfig,
	Session,
	StorageAdapter,
	StudentGroup,
} from "./types";

export class UiTMScraper {
	private storage: StorageAdapter;
	private version: string;

	constructor(config: ScraperConfig & { version?: string }) {
		this.storage = config.storage;
		this.version = config.version || "v1";
	}

	private async getJar(identifier: string = "default"): Promise<CookieJar> {
		const cacheKey = `uitm:cookies:${this.version}:${identifier}`;
		const cached = await this.storage.get(cacheKey);
		if (cached) {
			return CookieJar.fromJSON(cached);
		}
		return new CookieJar();
	}

	private async saveJar(
		jar: CookieJar,
		identifier: string = "default",
	): Promise<void> {
		const cacheKey = `uitm:cookies:${this.version}:${identifier}`;

		// Simple TTL logic: 10 minutes or based on cookies
		let ttlSeconds = 600;
		const cookies = await jar.getCookies("https://simsweb4.uitm.edu.my");
		if (cookies.length > 0) {
			const now = Date.now();
			for (const cookie of cookies) {
				if (cookie.expiryTime && typeof cookie.expiryTime === "function") {
					const expiryTime = cookie.expiryTime();
					if (expiryTime && expiryTime !== Number.POSITIVE_INFINITY) {
						const ttl = Math.floor((expiryTime - now) / 1000);
						if (ttl > 0 && ttl < ttlSeconds) {
							ttlSeconds = ttl;
						}
					}
				}
			}
		}
		ttlSeconds = Math.max(60, Math.min(ttlSeconds, 600));

		await this.storage.set(cacheKey, JSON.stringify(jar.toJSON()), ttlSeconds);
	}

	async getCampuses(mode: "campus" | "faculty" = "campus"): Promise<Campus[]> {
		const jar = await this.getJar();
		const { campusSelectLocation, facultySelectLocation } =
			await fetchScrapsFromRootPage(jar, this.storage, this.version);

		const location =
			mode === "campus" ? campusSelectLocation : facultySelectLocation;
		const rawData = await fetchIcress(
			`${location}&key=All&page=1&page_limit=30`,
			jar,
		);

		if (!rawData || rawData.includes("Error")) {
			throw new Error("Failed to fetch campuses");
		}

		const json = JSON.parse(rawData) as {
			results: Array<{ id: string; text: string }>;
			total: number;
		};

		await this.saveJar(jar);

		return json.results
			.filter((c) => c.id !== "X")
			.map((campus) => ({
				code: campus.id,
				name: campus.text,
				requireFaculty: campus.id === "B",
			}));
	}

	async getCourses(campus: string, faculty?: string | null): Promise<Course[]> {
		const jar = await this.getJar();
		const cacheKey = `uitm:courses:${this.version}:${campus}${faculty ? `:${faculty}` : ""}`;
		const cached = await this.storage.get(cacheKey);
		if (cached) return JSON.parse(cached) as Course[];

		const { tokens, indexResultLocation } = await fetchScrapsFromRootPage(
			jar,
			this.storage,
			this.version,
		);

		const body = new URLSearchParams({
			search_campus: campus,
			search_course: "",
			...tokens,
			...(faculty ? { search_faculty: faculty } : {}),
		}).toString();

		const data = await fetchIcress(
			indexResultLocation ?? "index_result.cfm",
			jar,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				},
				body,
			},
		);

		const root = parse(data);
		const trs = root.querySelectorAll("tr.gradeU");

		const courses = trs.map((tr) => {
			const code = tr.children[1].text.replace(
				/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g,
				"",
			);
			const path = tr.children[2].children[0].getAttribute("href")!;
			return {
				code,
				campusCode: campus,
				facultyCode: faculty || null,
				path,
			};
		});

		if (courses.length > 0) {
			await this.storage.set(cacheKey, JSON.stringify(courses), 1800);
		}

		await this.saveJar(jar);

		return courses;
	}

	async getGroups(path: string): Promise<Group[]> {
		const jar = await this.getJar();
		const response = await fetchIcress(path, jar);
		const root = parse(response);
		const rows = root.querySelectorAll("#example tbody tr").map((row) => {
			const cells = row
				.querySelectorAll("td")
				.map((cell) => cell.text.trim().replace("\n", " "));
			const [day, startTime, endTime] = parseTimeIcress(
				cells[1],
				DAY_MAP_ICRESS,
			);
			return {
				day,
				startTime,
				endTime,
				group: cells[2],
				mode: cells[3],
				status: cells[4],
				room: cells[5] || undefined,
			};
		});

		const grouped: Record<string, Session[]> = {};
		for (const row of rows) {
			grouped[row.group] ??= [];
			grouped[row.group].push({
				groupCode: row.group,
				room: row.room,
				day: row.day,
				start: formatClock(row.startTime),
				end: formatClock(row.endTime),
				mode: row.mode,
				status: row.status,
			});
		}

		await this.saveJar(jar);

		return Object.entries(grouped).map(([code, sessions]) => ({
			code,
			sessions,
		}));
	}

	async getStudentTimetable(studentId: string): Promise<StudentGroup[]> {
		const response = await fetch(
			`https://cdn.uitm.edu.my/jadual/baru/${studentId}.json`,
			{
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
					Referer: "https://mystudent.uitm.edu.my/",
				},
			},
		);

		if (!response.ok) throw new Error(`Failed to fetch student timetable`);

		const data = (await response.json()) as MyStudentAPIResponse;
		const grouped: Record<
			string,
			{
				courseName: string;
				courseCode: string;
				groupCode: string;
				sessions: Session[];
			}
		> = {};

		for (const [, dayData] of Object.entries(data) as Array<
			[string, MyStudentAPIResponse[string]]
		>) {
			if (!dayData?.jadual) continue;
			const day = DAY_MAP_MYSTUDENT[dayData.hari];
			if (!day) continue;

			for (const session of dayData.jadual) {
				const key = `${session.courseid}-${session.groups}`;
				if (!grouped[key]) {
					grouped[key] = {
						courseName: session.course_desc,
						courseCode: session.courseid,
						groupCode: session.groups,
						sessions: [],
					};
				}

				try {
					const [start, end] = parseTimeMyStudent(session.masa);
					const newSession: Session = {
						groupCode: session.groups,
						room: session.bilik || undefined,
						day,
						start,
						end,
						// lecturer: session.lecturer || undefined, // Session interface in types.ts doesn't have lecturer yet, let's add it if needed or just skip
					};

					const exists = grouped[key].sessions.some(
						(s) => s.day === newSession.day && s.start === newSession.start,
					);
					if (!exists) grouped[key].sessions.push(newSession);
				} catch (_e) {
					console.warn("Failed to parse", session);
				}
			}
		}

		return Object.values(grouped).map((g) => ({
			code: g.groupCode,
			courseName: g.courseName,
			courseCode: g.courseCode,
			sessions: g.sessions,
		}));
	}
}
