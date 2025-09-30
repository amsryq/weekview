import { faker } from "@faker-js/faker";
import { MeetingTime } from "~/lib/models/meeting-time";
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
					g.sessions.map(
						(s) => new Session(s.groupCode, s.room, s.day, s.start, s.end),
					),
				),
		);
	}

	toUiTMCourse(): UiTMGroup {
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
				background: {
					type: "solid",
					color: faker.color.rgb({ prefix: "#", casing: "lower" }),
				},
				fgColor: "#ffffff",
			},
			campus: this.course.campus.code,
			group: this.code,
			meetingTimes,
		});
	}
}
