import { MeetingTime } from "~/lib/models/meeting-time";
import {
	DEFAULT_TIMETABLE_STYLE_ID,
	getStableStyleIndex,
	getStyleColorByIndex,
} from "~/lib/models/style";
import { UiTMCourseSection } from "../course-section";
import { getStudentTimetable } from "../server/functions";
import { Group } from "./group";
import { Session } from "./session";

export interface MyStudentSession {
	groupCode: string;
	room?: string;
	day: number;
	start: string;
	end: string;
	lecturer?: string;
}

export interface MyStudentGroup {
	code: string;
	courseName: string;
	courseCode: string;
	sessions: MyStudentSession[];
}

interface FetchOptions {
	studentId: string;
	includeCourseName?: boolean;
}

export function createUiTMCourseSectionFromMyStudentGroup(
	group: MyStudentGroup,
	colorKey: string,
	includeCourseName = false,
): UiTMCourseSection {
	const sessions = group.sessions.map(
		(session) =>
			new Session(
				session.groupCode,
				session.room,
				session.day,
				session.start,
				session.end,
				undefined,
				undefined,
				session.lecturer,
			),
	);

	const mergedSessions = Group.mergeOverlappingAndConsecutiveSessions(sessions);

	const meetingTimes = mergedSessions.map((session) => {
		const meeting = MeetingTime.createFromSchema({
			day: session.day!,
			startTime: session.start!,
			endTime: session.end!,
			location: session.room ?? undefined,
		});
		if (session.lecturer) {
			meeting.description = session.lecturer;
		}
		return meeting;
	});

	const colorIndex = getStableStyleIndex(colorKey);

	return new UiTMCourseSection({
		code: group.courseCode,
		name: includeCourseName ? group.courseName : undefined,
		themeColorIndex: colorIndex,
		meetingTimes,
		group: group.code,
		campus: "mystudent",
		cellAppearance: {
			background: getStyleColorByIndex(DEFAULT_TIMETABLE_STYLE_ID, colorIndex),
			fgColor: "#ffffff",
		},
	});
}

export async function fetchMyStudentTimetable(
	options: FetchOptions,
): Promise<UiTMCourseSection[]> {
	const studentId = options.studentId.trim();
	if (!studentId) {
		throw new Error("Student ID is required.");
	}

	const data = await getStudentTimetable({ data: studentId });

	return data.map((group) =>
		createUiTMCourseSectionFromMyStudentGroup(
			group,
			`mystudent:${group.courseCode}:${group.code}`,
			options.includeCourseName ?? false,
		),
	);
}
