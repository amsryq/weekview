import { faker } from "@faker-js/faker";
import { MeetingTime } from "~/lib/models/meeting-time";
import { fetchFromBackend } from "~/lib/utils/backend";
import { TechnoGroup } from "../techno-group";
import { Course } from "./course";
import { Session } from "./session";

interface ServerSession {
	groupCode: string;
	room?: string;
	day: number;
	start: string;
	end: string;
	mode: string;
	status: string;
}

interface ServerGroup {
	code: string;
	courseCode: string;
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
		const data: ServerGroup[] = await fetchFromBackend(
			`/providers/uitm/icress/groups/${course.__path}`,
		).then((r) => r.json());
		return data.map(
			(g) =>
				new Group(
					g.code,
					course,
					g.sessions.map(
						(s) =>
							new Session(
								s.groupCode,
								s.room,
								s.day,
								s.start,
								s.end,
								s.mode,
								s.status,
							),
					),
				),
		);
	}

	toTechnoCourse(): TechnoGroup {
		const meetingTimes = this.sessions.map((session) =>
			MeetingTime.createFromSchema({
				day: session.day!,
				startTime: session.start!,
				endTime: session.end!,
				location: session.room || undefined,
			}),
		);

		return new TechnoGroup({
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
