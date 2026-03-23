import { parseArgs } from "node:util";
import { UiTMScraper } from "../src/client";
import type { StorageAdapter } from "../src/types";

// Mock storage for testing
const storage = new Map<string, { value: string; expiry: number | null }>();

const mockStorage: StorageAdapter = {
	get: async (key) => {
		const entry = storage.get(key);
		if (!entry) return null;
		if (entry.expiry !== null && entry.expiry < Date.now()) {
			storage.delete(key);
			return null;
		}
		return entry.value;
	},
	set: async (key, value, ttlSeconds) => {
		storage.set(key, {
			value,
			expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
		});
	},
	delete: async (key) => {
		storage.delete(key);
	},
};

async function main() {
	const { values } = parseArgs({
		options: {
			type: { type: "string", default: "schedule" },
			campus: { type: "string" },
			faculty: { type: "string" },
			course: { type: "string" },
		},
	});

	const scraper = new UiTMScraper({ storage: mockStorage });

	try {
		if (values.type === "campus" || values.type === "faculty") {
			const mode = values.type;
			console.error(`fetching ${mode} list...`);
			const results = await scraper.getCampuses(mode);
			console.log(JSON.stringify(results, null, 2));
			return;
		}

		if (values.type === "schedule") {
			if (!values.campus || !values.course) {
				console.error(
					"Usage for schedule: pnpm test:fetch --campus <campus> --course <course> [--faculty <faculty>]",
				);
				process.exit(1);
			}

			const targetCourseCode = values.course.toUpperCase();
			console.error(
				`fetching schedules for ${targetCourseCode} at ${values.campus}...`,
			);

			const courses = await scraper.getCourses(values.campus, values.faculty);
			const targetCourse = courses.find(
				(c) => c.code.toUpperCase() === targetCourseCode,
			);

			if (!targetCourse) {
				console.error(
					`Course ${targetCourseCode} not found in the list of available courses.`,
				);
				process.exit(1);
			}

			// @ts-ignore
			const libGroups = await scraper.getGroups(targetCourse.path);

			const result = {
				courseCode: targetCourseCode,
				groups: libGroups,
			};

			console.log(JSON.stringify(result, null, 2));
			return;
		}

		console.error("Unknown type. Use --type campus, --type faculty, or --type schedule (default).");
		process.exit(1);
	} catch (error) {
		console.error("Programmatic scraper failed:", error);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
