import { uniq } from "es-toolkit";
import { MeetingTime } from "~/lib/models/meeting-time";
import {
	DEFAULT_TIMETABLE_STYLE_ID,
	getStableStyleIndex,
	getStyleColorByIndex,
} from "~/lib/models/style";
import { getGroups } from "../server/functions";
import { UiTMCourseSection } from "../course-section";
import { Course } from "./course";
import { Session } from "./session";

interface ServerSession {
	groupCode: string;
	room?: string;
	day: number;
	start: string;
	end: string;
}

interface ServerGroup {
	code: string;
	sessions: ServerSession[];
}

export class Group {
	code: string;
	course: Course;
	sessions: Session[];

	constructor(code: string, course: Course, sessions: Session[]) {
		this.code = code;
		this.course = course;
		this.sessions = sessions;
	}

	static async fetch(course: Course): Promise<Group[]> {
		const data = await getGroups({ data: course.__path });

		return data.map(
			(g) =>
				new Group(
					g.code,
					course,
					Group.mergeOverlappingAndConsecutiveSessions(
						g.sessions.map(
							(s) => new Session(s.groupCode, s.room, s.day, s.start, s.end),
						),
					),
				),
		);
	}

	public static mergeOverlappingAndConsecutiveSessions(
		sessions: Session[],
	): Session[] {
		if (sessions.length <= 1) return sessions;

		// Sort sessions by day and start time
		const sorted = [...sessions].sort((a, b) => {
			if (a.day !== b.day) return (a.day ?? 0) - (b.day ?? 0);
			return (a.start ?? "").localeCompare(b.start ?? "");
		});

		const merged: Session[] = [];
		let current = sorted[0];

		for (let i = 1; i < sorted.length; i++) {
			const next = sorted[i];

			// Check if sessions are on the same day and overlap or are consecutive
			if (
				current.day === next.day &&
				current.end &&
				next.start &&
				(current.end === next.start // Consecutive
					? current.room === next.room // Same room for consecutive
					: current.end > next.start) // Overlapping
			) {
				const newEnd = current.end > (next.end ?? "") ? current.end : next.end;
				const newRoom = uniq(
					[current.room, next.room].map((u) => (!u ? "Online" : u)),
				).join(" / ");

				current = new Session(
					current.groupCode,
					newRoom,
					current.day,
					current.start,
					newEnd,
					current.mode,
					current.status,
					current.lecturer === next.lecturer ? current.lecturer : undefined,
				);
			} else {
				// No overlap, push current and move to next
				merged.push(current);
				current = next;
			}
		}

		merged.push(current);

		return merged;
	}

	toUiTMCourse(): UiTMCourseSection {
		const colorIndex = getStableStyleIndex(
			`${this.course.campus.code}:${this.course.code}:${this.code}`,
		);
		const meetingTimes = this.sessions.map((session) =>
			MeetingTime.createFromSchema({
				day: session.day!,
				startTime: session.start!,
				endTime: session.end!,
				location: session.room || undefined,
			}),
		);

		return new UiTMCourseSection({
			code: this.course.code,
			themeColorIndex: colorIndex,
			cellAppearance: {
				background: getStyleColorByIndex(DEFAULT_TIMETABLE_STYLE_ID, colorIndex),
				fgColor: "#ffffff",
			},
			campus: this.course.campus.code,
			group: this.code,
			meetingTimes,
		});
	}
}
