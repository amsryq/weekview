import { MeetingTime } from "~/lib/models/meeting-time";
import { getOrAssignSolidColorFor } from "~/lib/stores/color-store";
import { fetchFromBackend } from "~/lib/utils/backend";
import { UiTMGroup } from "../group";
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

export function createUiTMGroupFromMyStudentGroup(
	group: MyStudentGroup,
	colorKey: string,
	includeCourseName = false,
): UiTMGroup {
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

	const mergedSessions = Group.mergeOverlappingSessions(sessions);

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

	const color = getOrAssignSolidColorFor(colorKey);

	return new UiTMGroup({
		code: group.courseCode,
		name: includeCourseName ? group.courseName : undefined,
		meetingTimes,
		group: group.code,
		campus: "mystudent",
		cellAppearance: {
			background: color,
			fgColor: "#ffffff",
		},
	});
}

export async function fetchMyStudentTimetable(
	options: FetchOptions,
): Promise<UiTMGroup[]> {
	const studentId = options.studentId.trim();
	if (!studentId) {
		throw new Error("Student ID is required.");
	}

	const response = await fetchFromBackend(
		`/providers/uitm/mystudent/timetable/${encodeURIComponent(studentId)}`,
	);

	const data: MyStudentGroup[] = await response.json();

	return data.map((group) =>
		createUiTMGroupFromMyStudentGroup(
			group,
			`mystudent:${group.courseCode}:${group.code}`,
			options.includeCourseName ?? false,
		),
	);
}
