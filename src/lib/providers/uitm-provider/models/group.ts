import { MeetingTime } from "~/lib/models/meeting-time";
import { getOrAssignSolidColorFor } from "~/lib/stores/color-store";
import { fetchFromBackend } from "~/lib/utils/backend";
import { UiTMGroup } from "../group";
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
		const query = new URLSearchParams({
			path: encodeURIComponent(course.__path),
		}).toString();
		const data: ServerGroup[] = await fetchFromBackend(
			`/providers/uitm/icress/groups?${query}`,
		).then((r) => r.json());

		return data.map(
			(g) =>
				new Group(
					g.code,
					course,
					Group.mergeOverlappingSessions(
						g.sessions.map(
							(s) => new Session(s.groupCode, s.room, s.day, s.start, s.end),
						),
					),
				),
		);
	}

	private static mergeOverlappingSessions(sessions: Session[]): Session[] {
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
				current.end >= next.start
			) {
				// Merge sessions
				const newEnd = current.end > (next.end ?? "") ? current.end : next.end;
				const sameRoom = current.room === next.room;

				current = new Session(
					current.groupCode,
					sameRoom ? current.room : undefined, // Remove room if different
					current.day,
					current.start,
					newEnd,
					current.mode,
					current.status,
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

	toUiTMCourse(): UiTMGroup {
		const self = this;
		const meetingTimes = this.sessions.map((session) =>
			MeetingTime.createFromSchema({
				day: session.day!,
				startTime: session.start!,
				endTime: session.end!,
				location: session.room || undefined,
			}),
		);

		return new UiTMGroup({
			code: this.course.code,
			cellAppearance: {
				get background() {
					return getOrAssignSolidColorFor(
						`${self.course.campus.code}:${self.course.code}:${self.code}`,
					);
				},
				fgColor: "#ffffff",
			},
			campus: this.course.campus.code,
			group: this.code,
			meetingTimes,
		});
	}
}
