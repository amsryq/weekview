import { createServerFn } from "@tanstack/react-start";
import axios from "axios";
import { parse } from "node-html-parser";
import { Campus, Course, Group, MyStudentGroup, MyStudentSession, Session } from "~/types/uitm";
import { CacheKeys, createCacheService } from "../services/cache";
import { CookieJarService, createCookieJarService } from "../services/cookie-jar";
import { getStorage } from "./utils";

// Set UITM_MOCK=true in your .env (or wrangler.jsonc vars) to use dummy data
// when the UiTM server is offline.
const MOCK_MODE = process.env.UITM_MOCK === "true";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CAMPUSES = [
    { code: "B", name: "Shah Alam", requireFaculty: true },
    { code: "KA", name: "Kota Bharu", requireFaculty: false },
    { code: "ML", name: "Alor Gajah", requireFaculty: false },
    { code: "NS", name: "Seremban", requireFaculty: false },
    { code: "PP", name: "Arau", requireFaculty: false },
    { code: "SA", name: "Sabah", requireFaculty: false },
    { code: "SR", name: "Sarawak", requireFaculty: false },
];

const MOCK_FACULTIES = [
    { code: "CS", name: "Faculty of Computer & Mathematical Sciences", requireFaculty: false },
    { code: "EE", name: "Faculty of Electrical Engineering", requireFaculty: false },
    { code: "BE", name: "Faculty of Business & Management", requireFaculty: false },
    { code: "AP", name: "Faculty of Applied Sciences", requireFaculty: false },
    { code: "AR", name: "Faculty of Architecture, Planning & Surveying", requireFaculty: false },
];

const MOCK_COURSES = [
    { code: "CS220", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/CS220" } },
    { code: "CS230", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/CS230" } },
    { code: "CS250", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/CS250" } },
    { code: "CS260", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/CS260" } },
    { code: "MAT183", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/MAT183" } },
    { code: "PHY310", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/PHY310" } },
];

const MOCK_GROUPS = [
    {
        code: "CS220-CS2401A",
        sessions: [
            { groupCode: "CS220-CS2401A", day: 1, start: "08:00", end: "10:00", mode: "F2F", status: "Active", room: "BK-01-01" },
            { groupCode: "CS220-CS2401A", day: 3, start: "14:00", end: "16:00", mode: "F2F", status: "Active", room: "BK-01-01" },
        ],
    },
    {
        code: "CS220-CS2401B",
        sessions: [
            { groupCode: "CS220-CS2401B", day: 2, start: "10:00", end: "12:00", mode: "F2F", status: "Active", room: "BK-02-03" },
            { groupCode: "CS220-CS2401B", day: 4, start: "08:00", end: "10:00", mode: "F2F", status: "Active", room: "BK-02-03" },
        ],
    },
    {
        code: "CS220-CS2401C",
        sessions: [
            { groupCode: "CS220-CS2401C", day: 1, start: "14:00", end: "16:00", mode: "Online", status: "Active", room: undefined },
            { groupCode: "CS220-CS2401C", day: 5, start: "10:00", end: "12:00", mode: "Online", status: "Active", room: undefined },
        ],
    },
];

const MOCK_STUDENT_TIMETABLE = [
    {
        code: "CS2401A",
        courseName: "Data Structures",
        courseCode: "CS220",
        sessions: [
            { groupCode: "CS2401A", day: 1, start: "08:00", end: "10:00", room: "BK-01-01", lecturer: "Dr. Ahmad" },
            { groupCode: "CS2401A", day: 3, start: "14:00", end: "16:00", room: "BK-01-01", lecturer: "Dr. Ahmad" },
        ],
    },
    {
        code: "EE2401B",
        courseName: "Circuit Analysis",
        courseCode: "EE230",
        sessions: [
            { groupCode: "EE2401B", day: 2, start: "10:00", end: "12:00", room: "EE-Lab-1", lecturer: "Prof. Siti" },
        ],
    },
    {
        code: "MAT2401A",
        courseName: "Calculus II",
        courseCode: "MAT183",
        sessions: [
            { groupCode: "MAT2401A", day: 4, start: "08:00", end: "10:00", room: "DK-3", lecturer: "Dr. Lim" },
            { groupCode: "MAT2401A", day: 5, start: "12:00", end: "14:00", room: "DK-3", lecturer: "Dr. Lim" },
        ],
    },
];

// --- Internal Types ---

interface Clock {
    hour: number;
    minute: number;
}

interface RootScrapsSet {
    tokens: Record<string, string>;
    indexResultLocation: string | null;
    campusSelectLocation: string | null;
    facultySelectLocation: string | null;
}

const DAY_MAP_ICRESS: Record<string, number> = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
};

const DAY_MAP_MYSTUDENT: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
};

// --- Helpers ---

function formatClock(clock: Clock): string {
    return `${clock.hour.toString().padStart(2, "0")}:${clock.minute
        .toString()
        .padStart(2, "0")}`;
}

async function fetchIcress(
    path: string,
    cookieJarService: CookieJarService,
    options: {
        method?: string;
        headers?: Record<string, string>;
        data?: string;
    } = {},
) {
    const jar = await cookieJarService.getCookieJar();
    const url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/${path}`;

    const cookies = await jar.getCookies(url);
    const cookieHeader = cookies.map((c) => c.cookieString()).join("; ");

    try {
        const response = await axios.request({
            url,
            method: options.method || "GET",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
                Referer:
                    "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.cfm",
                ...(cookieHeader ? { Cookie: cookieHeader } : {}),
                ...options.headers,
            },
            responseType: "text",
            data: options.data,
        });

        const setCookieHeaders = response.headers["set-cookie"];
        if (setCookieHeaders) {
            if (Array.isArray(setCookieHeaders)) {
                for (const cookieStr of setCookieHeaders) {
                    try {
                        await jar.setCookie(cookieStr, url);
                    } catch (error) {
                        console.warn("Failed to set cookie:", cookieStr, error);
                    }
                }
            } else if (typeof setCookieHeaders === "string") {
                try {
                    await jar.setCookie(setCookieHeaders, url);
                } catch (error) {
                    console.warn("Failed to set cookie:", setCookieHeaders, error);
                }
            }
            await cookieJarService.saveCookieJar(jar);
        }

        return response.data as string;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Icress Error", error.response.status);
            throw new Error(`Icress returned ${error.response.status}`);
        }
        throw error;
    }
}

function extractAjaxUrl(scriptContent: string): string | null {
    const regex = /\$?.ajax:?\(?\s*{\s*url:\s*['"]([^'"]+)['"]/;
    const match = scriptContent.match(regex);
    return match ? match[1] : null;
}

async function fetchScrapsFromRootPage(
    cacheService: any, // Typed correctly in implementation
    cookieJarService: CookieJarService,
): Promise<RootScrapsSet> {
    const cacheKey = CacheKeys.uitm.tokens(`index.htm`);

    // Try cache (if cacheService supports get)
    if (cacheService) {
        const cachedTokens = await cacheService.get(cacheKey);
        if (cachedTokens) return cachedTokens as RootScrapsSet;
    }

    const htm = await fetchIcress("index.cfm", cookieJarService);
    const htmRoot = parse(htm);

    const scripts = htmRoot
        .querySelectorAll("script")
        .map((el) => el.innerHTML)
        .filter(Boolean);
    const tokens: Record<string, { id?: string; value: string }> = {};

    for (const input of htmRoot.querySelectorAll("input[type=hidden]")) {
        const name = input.getAttribute("name");
        const value = input.getAttribute("value") || "";
        const id = input.getAttribute("id");
        if (name) {
            tokens[name] = { id, value };
        }
    }

    for (const select of htmRoot.querySelectorAll('select[style*="width:0"]')) {
        const name = select.getAttribute("name");
        if (name) {
            const firstOption = select.querySelector("option");
            const value = firstOption?.getAttribute("value") || "";
            tokens[name] = { value };
        }
    }

    let indexResultLocation: string = "";
    let campusSelectLocation: string = "";
    let facultySelectLocation: string = "";

    for (const script of scripts) {
        if (script.includes("$('.find_cam_icress_student')")) {
            const match = extractAjaxUrl(script);
            if (match) campusSelectLocation = match;

            for (const [key, { id }] of Object.entries(tokens))
                if (id) {
                    const regex = new RegExp(
                        `document\\.getElementById\\(['"]${id}['"]\\)\\.value\\s*=\\s*['"]([^'"]+)['"]`,
                    );
                    const m = script.match(regex);
                    if (m) tokens[key] = { id, value: m[1] };
                }
        }

        if (script.includes("$('.find_fac_icress_student')")) {
            const match = extractAjaxUrl(script);
            if (match) facultySelectLocation = match;
        }

        if (script.includes("function check_form_before_submit()")) {
            const match = extractAjaxUrl(script);
            if (match) indexResultLocation = match;
        }
    }

    const scraps: RootScrapsSet = {
        tokens: Object.fromEntries(
            Object.entries(tokens).map(([k, v]) => [k, v.value]),
        ),
        indexResultLocation,
        campusSelectLocation,
        facultySelectLocation,
    };

    // Cache it
    if (cacheService) {
        await cacheService.set(cacheKey, scraps, 600);
    }

    return scraps;
}

// --- Server Functions ---

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

        // Sometimes rawData is empty or error page?
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
    .inputValidator(
        (d: { campus: string; faculty?: string | null }) => d,
    )
    .handler(async ({ data: { campus, faculty } }) => {
        if (MOCK_MODE) {
            return MOCK_COURSES.filter(
                (c) => c.campusCode === campus && (!faculty || c.facultyCode === faculty),
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

        // Cache if valid
        if (courses.length > 0) {
            await cache.set(cacheKey, courses, 1800);
        }

        return courses;
    });

function parseTimeIcress(timeString: string, dayMap: Record<string, number>): [number, Clock, Clock] {
    const regex = /(\w+) \( (\d{2}:\d{2}) (\w{2})-(\d{2}:\d{2}) (\w{2}) \)/;
    const match = timeString.match(regex);

    if (!match) throw new Error(`Failed to parse time string: ${timeString}`);

    const [, day, startTime, startPeriod, endTime, endPeriod] = match;

    if (!(day && day in dayMap)) throw new Error(`Invalid day: ${day}`);

    const parseClock = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return { hour: h, minute: m };
    };

    return [dayMap[day], parseClock(startTime), parseClock(endTime)];
}

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
            const [day, startTime, endTime] = parseTimeIcress(cells[1], DAY_MAP_ICRESS);
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

// --- MyStudent ---

interface MyStudentAPIResponse {
    [date: string]: null | {
        hari: string;
        jadual: Array<{
            course_desc: string;
            courseid: string;
            groups: string;
            masa: string;
            bilik: string | null;
            lecturer: string;
        }>;
    };
}

function parseTimeMyStudent(timeString: string): [string, string] {
    const match = timeString.match(
        /(\d{2}:\d{2})\s+(AM|PM)\s*-\s*(\d{2}:\d{2})\s+(AM|PM)/,
    );
    if (!match) throw new Error(`Invalid time: ${timeString}`);

    const [, startTime, startPeriod, endTime, endPeriod] = match;

    const convert = (t: string, p: string) => {
        const [h, m] = t.split(":").map(Number);
        let h24 = h;
        if (h >= 13) h24 = h;
        else if (p === "PM" && h !== 12) h24 = h + 12;
        else if (p === "AM" && h === 12) h24 = 0;
        return `${h24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    };

    return [convert(startTime, startPeriod), convert(endTime, endPeriod)];
}

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
                sessions: MyStudentSession[];
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
                    const newSession: MyStudentSession = {
                        groupCode: session.groups,
                        room: session.bilik || undefined,
                        day,
                        start,
                        end,
                        lecturer: session.lecturer || undefined,
                    };

                    // Dedupe logic
                    const exists = grouped[key].sessions.some(s => s.day === newSession.day && s.start === newSession.start);
                    if (!exists) grouped[key].sessions.push(newSession);

                } catch (e) {
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
