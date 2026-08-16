import { parse } from "node-html-parser";
import { CookieJar } from "tough-cookie";
import type { Clock, RootScrapsSet, StorageAdapter } from "./types";

export const DAY_MAP_ICRESS = {
	MONDAY: 1,
	TUESDAY: 2,
	WEDNESDAY: 3,
	THURSDAY: 4,
	FRIDAY: 5,
	SATURDAY: 6,
	SUNDAY: 7,
} satisfies Record<string, number>;

export const DAY_MAP_MYSTUDENT = {
	Monday: 1,
	Tuesday: 2,
	Wednesday: 3,
	Thursday: 4,
	Friday: 5,
	Saturday: 6,
	Sunday: 7,
} satisfies Record<string, number>;

export function formatClock(clock: Clock): string {
	return `${clock.hour.toString().padStart(2, "0")}:${clock.minute
		.toString()
		.padStart(2, "0")}`;
}

export async function fetchIcress(
	path: string,
	jar: CookieJar,
	options: {
		method?: string;
		headers?: Record<string, string>;
		body?: string;
		referer?: string;
	} = {},
) {
	const url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/${path}`;

	const cookies = await jar.getCookies(url);
	const cookieHeader = cookies.map((c) => c.cookieString()).join("; ");

	const headers = new Headers({
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
		Referer:
			options.referer ||
			"https://simsweb4.uitm.edu.my/estudent/class_timetable/index.cfm",
	});
	if (options.headers) {
		for (const [k, v] of Object.entries(options.headers)) {
			headers.set(k, v);
		}
	}
	if (cookieHeader) {
		headers.set("Cookie", cookieHeader);
	}

	const response = await fetch(url, {
		method: options.method || "GET",
		headers,
		body: options.body,
	});

	if (!response.ok) {
		// SAFETY: Custom HTTP status attachment on standard Error instance
		const error = new Error(`Icress returned ${response.status}`) as Error & {
			status?: number;
		};
		error.status = response.status;
		throw error;
	}

	const setCookieHeaders = response.headers.getSetCookie();
	if (setCookieHeaders.length > 0) {
		for (const cookieStr of setCookieHeaders) {
			try {
				await jar.setCookie(cookieStr, url);
			} catch (error) {
				console.warn("Failed to set cookie:", cookieStr, error);
			}
		}
	}

	return {
		text: await response.text(),
		url: response.url,
	};
}

export function extractAjaxUrl(scriptContent: string): string | null {
	// Multiple patterns to robustly extract AJAX/fetch endpoints from inlined scripts.
	// The site has used $.ajax, $.post, $.get, select2 ajax.url and even fetch() in the past.
	const patterns: RegExp[] = [
		/url\s*:\s*['"]([^'")]+)['"]/m,
		/\$\.ajax\(\s*['"]([^'")]+)['"]/m,
		/\$\.post\(\s*['"]([^'")]+)['"]/m,
		/\$\.get\(\s*['"]([^'")]+)['"]/m,
		/\.select2\(\s*{[\s\S]*?ajax\s*:\s*{[\s\S]*?url\s*:\s*['"]([^'")]+)['"]/m,
		/fetch\(\s*['"]([^'")]+)['"]/m,
	];

	for (const regex of patterns) {
		const m = scriptContent.match(regex);
		if (m && m[1]) return m[1];
	}

	return null;
}

export async function fetchScrapsFromRootPage(
	jar: CookieJar,
	storage: StorageAdapter,
	version: string = "v1",
): Promise<RootScrapsSet> {
	const cacheKey = `uitm:tokens:${version}:index.htm`;
	const cached = await storage.get(cacheKey);
	if (cached) {
		// SAFETY: Cached scraps payload matches RootScrapsSet structure
		return JSON.parse(cached) as RootScrapsSet;
	}

	const { text: htm, url: indexUrl } = await fetchIcress("index.cfm", jar);
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
		} else if (id) {
			tokens[id] = { id, value };
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
		}

		if (script.includes("$('.find_fac_icress_student')")) {
			const match = extractAjaxUrl(script);
			if (match) facultySelectLocation = match;
		}

		if (script.includes("function check_form_before_submit()")) {
			const match = extractAjaxUrl(script);
			if (match) indexResultLocation = match;

			// Collect token assignments from various patterns used on the page.
			// Examples: document.getElementById('x').value = 'y'
			// document.getElementsByName('name')[0].value = 'v'
			// $("#id").val('v') or $("input[name='x']").val('v')
			const tokenPatterns: Array<{
				regex: RegExp;
				type: "id" | "name" | "selector";
			}> = [
				{
					regex:
						/document\.getElementById\(['"]([^'")]+)['"]\)\.value\s*=\s*['"]([^'")]+)['"]/g,
					type: "id",
				},
				{
					regex:
						/document\.getElementsByName\(['"]([^'")]+)['"]\)\s*\[\s*0\s*\]\.value\s*=\s*['"]([^'")]+)['"]/g,
					type: "name",
				},
				{
					regex:
						/document\.querySelector\(\s*['"].*?name\s*=\s*['"]([^'")]+)['"].*?['"]\s*\)\.value\s*=\s*['"]([^'")]+)['"]/g,
					type: "name",
				},
				{
					regex:
						/document\.querySelector\(\s*['"].*?#([^'")]+).*?['"]\s*\)\.value\s*=\s*['"]([^'")]+)['"]/g,
					type: "id",
				},
				{
					regex:
						/\$\(\s*['"]#([^'")]+)['"]\s*\)\.val\(\s*['"]([^'")]+)['"]\s*\)/g,
					type: "id",
				},
				{
					regex:
						/\$\(\s*['"][^'"]*name\s*=\s*['"]([^'")]+)['"][^'"]*['"]\s*\)\.val\(\s*['"]([^'")]+)['"]\s*\)/g,
					type: "name",
				},
			];

			for (const p of tokenPatterns) {
				let m: RegExpExecArray | null;
				while ((m = p.regex.exec(script)) !== null) {
					if (!m[1]) continue;
					const key = m[1];
					const value = m[2] ?? "";

					if (p.type === "id") {
						let found = false;
						for (const [name, token] of Object.entries(tokens)) {
							if (token.id === key) {
								tokens[name] = { id: key, value };
								found = true;
							}
						}
						if (!found || !Object.values(tokens).some((t) => t.id === key)) {
							tokens[key] = { id: key, value };
						}
					} else if (p.type === "name") {
						if (tokens[key]?.id) {
							tokens[key] = { ...tokens[key], value };
						} else {
							tokens[key] = { value };
						}
					} else {
						tokens[key] = { value };
					}
				}
			}
		}
	}

	if (!indexResultLocation)
		console.warn("Diagnostic: indexResultLocation not found in scripts.");
	if (!campusSelectLocation)
		console.warn("Diagnostic: campusSelectLocation not found in scripts.");
	if (!facultySelectLocation)
		console.warn("Diagnostic: facultySelectLocation not found in scripts.");

	const scraps: RootScrapsSet = {
		tokens: Object.fromEntries(
			Object.entries(tokens).map(([k, v]) => [k, v.value]),
		),
		indexLocation: indexUrl,
		indexResultLocation,
		campusSelectLocation,
		facultySelectLocation,
	};

	await storage.set(cacheKey, JSON.stringify(scraps), 600);
	return scraps;
}

function parseClock(t: string): Clock {
	const [h, m] = t.split(":").map(Number);
	return { hour: h, minute: m };
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

	return [dayMap[day], parseClock(startTime), parseClock(endTime)];
}

function convertMyStudentTime(t: string, p: string): string {
	const [h, m] = t.split(":").map(Number);
	let h24 = h;
	if (h >= 13) h24 = h;
	else if (p === "PM" && h !== 12) h24 = h + 12;
	else if (p === "AM" && h === 12) h24 = 0;
	return `${h24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function parseTimeMyStudent(timeString: string): [string, string] {
	const match = timeString.match(
		/(\d{2}:\d{2})\s+(AM|PM)\s*-\s*(\d{2}:\d{2})\s+(AM|PM)/,
	);
	if (!match) throw new Error(`Invalid time: ${timeString}`);

	const [, startTime, startPeriod, endTime, endPeriod] = match;

	return [
		convertMyStudentTime(startTime, startPeriod),
		convertMyStudentTime(endTime, endPeriod),
	];
}
