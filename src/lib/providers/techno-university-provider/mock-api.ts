import { delay } from "es-toolkit";
import { Clock } from "~/lib/models/clock";
import { MeetingTime } from "~/lib/models/meeting-time";
import { TechnoCourse } from "./techno-course";
import type {
	ServerCampus,
	ServerCourse,
	ServerFaculty,
	ServerTimetableData,
} from "./types";

const MOCK_COURSES: ServerCourse[] = [
	{ code: "CSC110", path: "/path/CSC110" },
	{ code: "MAT183", path: "/path/MAT183" },
	{ code: "ELC543", path: "/path/ELC543" },
	{ code: "PHY201", path: "/path/PHY201" },
	{ code: "CSC210", path: "/path/CSC210" },
	{ code: "CSC305", path: "/path/CSC305" },
	{ code: "MAT285", path: "/path/MAT285" },
];

const MOCK_CAMPUSES: ServerCampus[] = [
	{ code: "A", name: "Shah Alam Campus", requiresFaculty: true },
	{ code: "B", name: "Melaka Campus", requiresFaculty: false },
	{ code: "P", name: "Penang Campus", requiresFaculty: false },
	{ code: "R", name: "Perak Campus", requiresFaculty: true },
	{ code: "J", name: "Johor Campus", requiresFaculty: false },
];

const MOCK_FACULTIES: ServerFaculty[] = [
	{ code: "fskm", name: "Faculty of Computer Science" },
	{ code: "fsktm", name: "Faculty of Information Technology" },
	{ code: "fpe", name: "Faculty of Engineering" },
	{ code: "fsains", name: "Faculty of Applied Sciences" },
	{ code: "fba", name: "Faculty of Business Administration" },
];

const MOCK_COURSE_DATA: Record<
	string,
	Record<
		string,
		{
			campus: string;
			code: string;
			group: string;
			color: string;
			name: string;
			meetingTimes: { day: number; startTime: string; endTime: string }[];
		}
	>
> = {
	CSC110: {
		M3CS1102A: {
			campus: "main",
			code: "CSC110",
			group: "M3CS1102A",
			color: "#3b82f6",
			name: "CSC110",
			meetingTimes: [
				{ day: 1, startTime: "10:00", endTime: "12:00" },
				{ day: 1, startTime: "14:00", endTime: "16:00" },
			],
		},
		M3CS1102B: {
			campus: "main",
			code: "CSC110",
			group: "M3CS1102B",
			color: "#3b82f6",
			name: "CSC110",
			meetingTimes: [
				{ day: 2, startTime: "08:00", endTime: "10:00" },
				{ day: 4, startTime: "10:00", endTime: "12:00" },
			],
		},
		M3CS1102C: {
			campus: "main",
			code: "CSC110",
			group: "M3CS1102C",
			color: "#3b82f6",
			name: "CSC110",
			meetingTimes: [{ day: 3, startTime: "14:00", endTime: "16:00" }],
		},
	},
	MAT183: {
		M3CS1102A: {
			campus: "main",
			code: "MAT183",
			group: "M3CS1102A",
			color: "#f59e42",
			name: "MAT183",
			meetingTimes: [{ day: 2, startTime: "10:00", endTime: "12:00" }],
		},
		M3CS1102B: {
			campus: "main",
			code: "MAT183",
			group: "M3CS1102B",
			color: "#f59e42",
			name: "MAT183",
			meetingTimes: [{ day: 3, startTime: "08:00", endTime: "10:00" }],
		},
	},
	ELC543: {
		M3EL1301A: {
			campus: "main",
			code: "ELC543",
			group: "M3EL1301A",
			color: "#10b981",
			name: "ELC543",
			meetingTimes: [{ day: 4, startTime: "08:00", endTime: "10:00" }],
		},
		M3EL1301B: {
			campus: "main",
			code: "ELC543",
			group: "M3EL1301B",
			color: "#10b981",
			name: "ELC543",
			meetingTimes: [{ day: 5, startTime: "10:00", endTime: "12:00" }],
		},
		M3EL1301C: {
			campus: "main",
			code: "ELC543",
			group: "M3EL1301C",
			color: "#10b981",
			name: "ELC543",
			meetingTimes: [{ day: 1, startTime: "08:00", endTime: "10:00" }],
		},
	},
	PHY201: {
		M3PH2101A: {
			campus: "main",
			code: "PHY201",
			group: "M3PH2101A",
			color: "#f43f5e",
			name: "PHY201",
			meetingTimes: [{ day: 2, startTime: "14:00", endTime: "16:00" }],
		},
		M3PH2101B: {
			campus: "main",
			code: "PHY201",
			group: "M3PH2101B",
			color: "#f43f5e",
			name: "PHY201",
			meetingTimes: [{ day: 5, startTime: "08:00", endTime: "10:00" }],
		},
	},
	CSC210: {
		M3CS2103A: {
			campus: "main",
			code: "CSC210",
			group: "M3CS2103A",
			color: "#6366f1",
			name: "CSC210",
			meetingTimes: [{ day: 3, startTime: "10:00", endTime: "12:00" }],
		},
		M3CS2103B: {
			campus: "main",
			code: "CSC210",
			group: "M3CS2103B",
			color: "#6366f1",
			name: "CSC210",
			meetingTimes: [{ day: 4, startTime: "14:00", endTime: "16:00" }],
		},
	},
};

function buildTimetableFromMock(course: ServerCourse): ServerTimetableData {
	const courseGroups = MOCK_COURSE_DATA[course.code] ?? {};

	const rows = Object.values(courseGroups).flatMap((g) =>
		g.meetingTimes.map((mt) => ({
			day: mt.day,
			startTime: Clock.fromString(mt.startTime),
			endTime: Clock.fromString(mt.endTime),
			group: g.group,
			mode: "Physical",
			status: "Confirmed",
			room: "DK1-101",
		})),
	);

	return {
		course: course.code,
		campus: Object.values(courseGroups)[0]?.campus ?? "main",
		rows,
	};
}

export async function fetchCampuses(): Promise<ServerCampus[]> {
	await delay(1000);
	return MOCK_CAMPUSES;
}

export async function fetchFaculties(): Promise<ServerFaculty[]> {
	await delay(1000);
	return MOCK_FACULTIES;
}

export async function fetchCourses(
	_campus: string,
	_faculty: string | undefined = undefined,
): Promise<ServerCourse[]> {
	await delay(1000);
	return MOCK_COURSES;
}

export async function fetchTimetable(
	course: ServerCourse,
): Promise<ServerTimetableData> {
	await delay(1000);
	return buildTimetableFromMock(course);
}

export function timetableDataToTechnoCourses(
	timetableData: ServerTimetableData,
): TechnoCourse[] {
	const courses: Map<string, TechnoCourse> = new Map();

	for (const row of timetableData.rows) {
		if (!courses.has(row.group)) {
			const course = new TechnoCourse({
				code: timetableData.course,
				name: timetableData.course,
				cellAppearance: {
					background: {
						type: "solid",
						color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
					},
					fgColor: "#fff",
				},
				campus: timetableData.campus,
				group: row.group,
				meetingTimes: [
					MeetingTime.createFromSchema({
						day: row.day,
						startTime: row.startTime.toString(),
						endTime: row.endTime.toString(),
						location: row.room || undefined,
					}),
				],
			});

			courses.set(row.group, course);
		} else {
			const existingCourse = courses.get(row.group);
			if (existingCourse) {
				existingCourse.meetingTimes.push(
					MeetingTime.createFromSchema({
						day: row.day,
						startTime: row.startTime.toString(),
						endTime: row.endTime.toString(),
						location: row.room || undefined,
					}),
				);
			}
		}
	}

	return [...courses.values()];
}
