import { createServerFn } from "@tanstack/react-start";
import { UiTMScraper } from "@weekview/uitm-scraper";
import { getInMemoryStorage } from "~/server/functions/utils";
import {
	getMockCourses,
	getMockGroups,
	getMockStudentTimetable,
	MOCK_CAMPUSES,
	MOCK_FACULTIES,
	MOCK_MODE,
} from "./mock-data";

const scraper = new UiTMScraper({
	storage: getInMemoryStorage().asStorageAdapter(),
});

export const getCampuses = createServerFn({ method: "GET" })
	.inputValidator((mode: "campus" | "faculty") => mode)
	.handler(async ({ data: mode }) => {
		if (MOCK_MODE) {
			return mode === "campus" ? MOCK_CAMPUSES : MOCK_FACULTIES;
		}
		return scraper.getCampuses(mode);
	});

export const getCourses = createServerFn({ method: "GET" })
	.inputValidator((d: { campus: string; faculty?: string | null }) => d)
	.handler(async ({ data: { campus, faculty } }) => {
		if (MOCK_MODE) {
			return getMockCourses(campus, faculty);
		}
		return scraper.getCourses(campus, faculty);
	});

export const getGroups = createServerFn({ method: "GET" })
	.inputValidator((path: string) => path)
	.handler(async ({ data: path }) => {
		if (MOCK_MODE) {
			const courseCode = path.split("/").pop() || "UNKNOWN";
			return getMockGroups(courseCode);
		}
		return scraper.getGroups(path);
	});

export const getStudentTimetable = createServerFn({ method: "GET" })
	.inputValidator((studentId: string) => studentId)
	.handler(async ({ data: studentId }) => {
		if (MOCK_MODE) {
			return getMockStudentTimetable(studentId);
		}
		return scraper.getStudentTimetable(studentId);
	});
