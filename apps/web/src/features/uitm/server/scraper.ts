import axios from "axios";
import { parse } from "node-html-parser";
import { CacheKeys, type CacheService } from "~/server/services/cache";
import { type CookieJarService } from "~/server/services/cookie-jar";

export interface Clock {
	hour: number;
	minute: number;
}

export interface RootScrapsSet {
	tokens: Record<string, string>;
	indexResultLocation: string | null;
	campusSelectLocation: string | null;
	facultySelectLocation: string | null;
}

export interface MyStudentAPIResponse {
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

export const DAY_MAP_ICRESS: Record<string, number> = {
	MONDAY: 1,
	TUESDAY: 2,
	WEDNESDAY: 3,
	THURSDAY: 4,
	FRIDAY: 5,
	SATURDAY: 6,
	SUNDAY: 7,
};

export const DAY_MAP_MYSTUDENT: Record<string, number> = {
	Monday: 1,
	Tuesday: 2,
	Wednesday: 3,
	Thursday: 4,
	Friday: 5,
	Saturday: 6,
	Sunday: 7,
};

export function formatClock(clock: Clock): string {
	return `${clock.hour.toString().padStart(2, "0")}:${clock.minute
		.toString()
		.padStart(2, "0")}`;
}

export async function fetchIcress(
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

export function extractAjaxUrl(scriptContent: string): string | null {
	const regex = /\$?.ajax:?\(?\s*{\s*url:\s*['"]([^'"]+)['"]/;
	const match = scriptContent.match(regex);
	return match ? match[1] : null;
}

export async function fetchScrapsFromRootPage(
	cacheService: CacheService,
	cookieJarService: CookieJarService,
): Promise<RootScrapsSet> {
	const cacheKey = CacheKeys.uitm.tokens(`index.htm`);

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

	let indexResultLocation = "";
	let campusSelectLocation = "";
	let facultySelectLocation = "";

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

	if (cacheService) {
		await cacheService.set(cacheKey, scraps, 600);
	}

	return scraps;
}

export function parseTimeIcress(
	timeString: string,
	dayMap: Record<string, number>,
): [number, Clock, Clock] {
	const regex = /(\w+) \( (\d{2}:\d{2}) (\w{2})-(\d{2}:\d{2}) (\w{2}) \)/;
	const match = timeString.match(regex);

	if (!match) throw new Error(`Failed to parse time string: ${timeString}`);

	const [, day, startTime, , endTime] = match;

	if (!(day && day in dayMap)) throw new Error(`Invalid day: ${day}`);

	const parseClock = (t: string): Clock => {
		const [h, m] = t.split(":").map(Number);
		return { hour: h, minute: m };
	};

	return [dayMap[day], parseClock(startTime), parseClock(endTime)];
}

export function parseTimeMyStudent(timeString: string): [string, string] {
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
