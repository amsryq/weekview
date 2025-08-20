import { MeetingTime } from "~/lib/models/meeting-time";
import { TechnoCourse } from "./techno-course";
import type { Campus, Faculty } from "./types";

export const campuses: Campus[] = [
	{ id: "main", name: "Main Campus", requiresFaculty: true },
	{ id: "melaka", name: "Melaka", requiresFaculty: false },
];

export const faculties: Record<string, Faculty[]> = {
	main: [{ id: "fskm", name: "Computer Science Faculty" }],
};

export const mockCourses: { code: string }[] = [
	{ code: "CSC110" },
	{ code: "MAT183" },
	{ code: "ELC543" },
	{ code: "PHY201" },
	{ code: "CSC210" },
];

export const mockGroups: Record<string, string[]> = {
	CSC110: ["M3CS1102A", "M3CS1102B", "M3CS1102C"],
	MAT183: ["M3CS1102A", "M3CS1102B"],
	ELC543: ["M3EL1301A", "M3EL1301B", "M3EL1301C"],
	PHY201: ["M3PH2101A", "M3PH2101B"],
	CSC210: ["M3CS2103A", "M3CS2103B"],
};

export function getMockCourseObject(course: string, group: string) {
	const campus = "main";

	if (course === "CSC110") {
		if (group === "M3CS1102A") {
			return new TechnoCourse({
				campus,
				code: "CSC110",
				group: "M3CS1102A",
				color: "#3b82f6",
				name: "CSC110",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 1,
						startTime: "10:00",
						endTime: "12:00",
					}),
					MeetingTime.createFromSchema({
						day: 1,
						startTime: "14:00",
						endTime: "16:00",
					}),
				],
			});
		}
		if (group === "M3CS1102B") {
			return new TechnoCourse({
				campus,
				code: "CSC110",
				group: "M3CS1102B",
				color: "#3b82f6",
				name: "CSC110",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 2,
						startTime: "08:00",
						endTime: "10:00",
					}),
					MeetingTime.createFromSchema({
						day: 4,
						startTime: "10:00",
						endTime: "12:00",
					}),
				],
			});
		}
		if (group === "M3CS1102C") {
			return new TechnoCourse({
				campus,
				code: "CSC110",
				group: "M3CS1102C",
				color: "#3b82f6",
				name: "CSC110",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 3,
						startTime: "14:00",
						endTime: "16:00",
					}),
				],
			});
		}
	}

	if (course === "MAT183") {
		if (group === "M3CS1102A") {
			return new TechnoCourse({
				campus,
				code: "MAT183",
				group: "M3CS1102A",
				color: "#f59e42",
				name: "MAT183",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 2,
						startTime: "10:00",
						endTime: "12:00",
					}),
				],
			});
		}
		if (group === "M3CS1102B") {
			return new TechnoCourse({
				campus,
				code: "MAT183",
				group: "M3CS1102B",
				color: "#f59e42",
				name: "MAT183",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 3,
						startTime: "08:00",
						endTime: "10:00",
					}),
				],
			});
		}
	}

	if (course === "ELC543") {
		if (group === "M3EL1301A") {
			return new TechnoCourse({
				campus,
				code: "ELC543",
				group: "M3EL1301A",
				color: "#10b981",
				name: "ELC543",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 4,
						startTime: "08:00",
						endTime: "10:00",
					}),
				],
			});
		}
		if (group === "M3EL1301B") {
			return new TechnoCourse({
				campus,
				code: "ELC543",
				group: "M3EL1301B",
				color: "#10b981",
				name: "ELC543",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 5,
						startTime: "10:00",
						endTime: "12:00",
					}),
				],
			});
		}
		if (group === "M3EL1301C") {
			return new TechnoCourse({
				campus,
				code: "ELC543",
				group: "M3EL1301C",
				color: "#10b981",
				name: "ELC543",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 1,
						startTime: "08:00",
						endTime: "10:00",
					}),
				],
			});
		}
	}

	if (course === "PHY201") {
		if (group === "M3PH2101A") {
			return new TechnoCourse({
				campus,
				code: "PHY201",
				group: "M3PH2101A",
				color: "#f43f5e",
				name: "PHY201",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 2,
						startTime: "14:00",
						endTime: "16:00",
					}),
				],
			});
		}
		if (group === "M3PH2101B") {
			return new TechnoCourse({
				campus,
				code: "PHY201",
				group: "M3PH2101B",
				color: "#f43f5e",
				name: "PHY201",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 5,
						startTime: "08:00",
						endTime: "10:00",
					}),
				],
			});
		}
	}

	if (course === "CSC210") {
		if (group === "M3CS2103A") {
			return new TechnoCourse({
				campus,
				code: "CSC210",
				group: "M3CS2103A",
				color: "#6366f1",
				name: "CSC210",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 3,
						startTime: "10:00",
						endTime: "12:00",
					}),
				],
			});
		}
		if (group === "M3CS2103B") {
			return new TechnoCourse({
				campus,
				code: "CSC210",
				group: "M3CS2103B",
				color: "#6366f1",
				name: "CSC210",
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: 4,
						startTime: "14:00",
						endTime: "16:00",
					}),
				],
			});
		}
	}

	throw new Error("Course or group not found");
}
