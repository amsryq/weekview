import { createServerFn } from "@tanstack/react-start";
import { parse } from "node-html-parser";
import { getStorage } from "~/server/functions/utils";
import { CacheKeys, createCacheService } from "~/server/services/cache";
import { createCookieJarService } from "~/server/services/cookie-jar";
import type { Course, MyStudentGroup, Session } from "../types";
import {
	MOCK_CAMPUSES,
	MOCK_COURSES,
	MOCK_FACULTIES,
	MOCK_GROUPS,
	MOCK_MODE,
	MOCK_STUDENT_TIMETABLE,
} from "./mock-data";
import {
	DAY_MAP_ICRESS,
	DAY_MAP_MYSTUDENT,
	fetchIcress,
	fetchScrapsFromRootPage,
	formatClock,
	type MyStudentAPIResponse,
	parseTimeIcress,
	parseTimeMyStudent,
} from "./scraper";

export const getCampuses = createServerFn({ method: "GET" })
	.inputValidator((mode: "campus" | "faculty") => mode)
	.handler(async ({ data: mode }) => {
		if (MOCK_MODE) {
			return mode === "campus" ? MOCK_CAMPUSES : MOCK_FACULTIES;
		}

		const storage = getStorage();
		const cache = createCacheService(storage);
		const cookieJar = createCookieJarService(cache);

		const { campusSelectLocation, facultySelectLocation } =
			await fetchScrapsFromRootPage(cache, cookieJar);

		const rawData = await fetchIcress(
			`${mode === "campus" ? campusSelectLocation : facultySelectLocation}&key=All&page=1&page_limit=30`,
			cookieJar,
		);

		if (!rawData || rawData.includes("Error")) {
			throw new Error("Failed to fetch campuses");
		}

		const json = JSON.parse(rawData) as {
			results: Array<{ id: string; text: string }>;
			total: number;
		};

		return json.results
			.filter((c) => c.id !== "X")
			.map((campus) => ({
				code: campus.id,
				name: campus.text,
				requireFaculty: campus.id === "B",
			}));
	});

export const getCourses = createServerFn({ method: "GET" })
	.inputValidator((d: { campus: string; faculty?: string | null }) => d)
	.handler(async ({ data: { campus, faculty } }) => {
		if (MOCK_MODE) {
			return MOCK_COURSES.filter(
				(c) =>
					c.campusCode === campus && (!faculty || c.facultyCode === faculty),
			);
		}

		const storage = getStorage();
		const cache = createCacheService(storage);
		const cookieJar = createCookieJarService(cache);

		const cacheKey = CacheKeys.uitm.courses(campus, faculty || undefined);
		const cached = await cache.get<Course[]>(cacheKey);
		if (cached) return cached;

		const { tokens, indexResultLocation } = await fetchScrapsFromRootPage(
			cache,
			cookieJar,
		);

		const body = new URLSearchParams({
			search_campus: campus,
			search_course: "",
			...tokens,
			...(faculty ? { search_faculty: faculty } : {}),
		}).toString();

		const data = await fetchIcress(
			indexResultLocation ?? "index_result.cfm",
			cookieJar,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				},
				data: body,
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
				__internal: { path },
			};
		});

		if (courses.length > 0) {
			await cache.set(cacheKey, courses, 1800);
		}

		return courses;
	});

export const getGroups = createServerFn({ method: "GET" })
	.inputValidator((path: string) => path)
	.handler(async ({ data: path }) => {
		if (MOCK_MODE) {
			return MOCK_GROUPS;
		}

		const storage = getStorage();
		const cache = createCacheService(storage);
		const cookieJar = createCookieJarService(cache);

		const response = await fetchIcress(path, cookieJar);
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

		return Object.entries(grouped).map(([code, sessions]) => ({
			code,
			sessions,
		}));
	});

export const getStudentTimetable = createServerFn({ method: "GET" })
	.inputValidator((studentId: string) => studentId)
	.handler(async ({ data: studentId }) => {
		if (MOCK_MODE) {
			return MOCK_STUDENT_TIMETABLE;
		}

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
				sessions: MyStudentGroup["sessions"];
			}
		> = {};

		for (const [, dayData] of Object.entries(data)) {
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
					const newSession = {
						groupCode: session.groups,
						room: session.bilik || undefined,
						day,
						start,
						end,
						lecturer: session.lecturer || undefined,
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
	});
