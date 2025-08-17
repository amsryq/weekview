import { immerable } from "immer";
import z from "zod";
import { ManualCourseProvider } from "../providers/manual-course-provider";
import { randomUUID } from "../utils";
import type { Clock } from "./clock";
import type { CourseProvider } from "./course-provider";
import { MeetingTime } from "./meeting-time";

type CourseConstructorProps = {
	code: string;
	name: string;
	color: string;
	meetingTimes?: MeetingTime[];
	notes?: string;
	tags?: string[];
	provider?: CourseProvider;
};

const courseSchema = z.object({
	code: z.string().min(1, "Course code is required"),
	name: z.string().min(1, "Course name is required"),
	color: z.string().min(1, "Color is required"),
	meetingTimes: z
		.array(MeetingTime.schema)
		.min(1, "At least one meeting time is required"),
	notes: z.string().optional(),
	tags: z.string().optional(),
});

export namespace Course {
	export type Schema = z.infer<typeof courseSchema>;
	export type SyncStatus = "pending" | "synced" | "error";
}

export class Course {
	[immerable] = true;

	public static schema = courseSchema;

	public id: string;
	public code: string;
	public name: string;
	public color: string;
	public meetingTimes: MeetingTime[];
	public notes?: string;
	public tags?: string[];

	public provider: CourseProvider;
	public syncStatus: Course.SyncStatus = "synced";

	constructor(data: CourseConstructorProps) {
		this.id = randomUUID();
		this.code = data.code;
		this.name = data.name;
		this.color = data.color;
		this.meetingTimes = data.meetingTimes || [];
		this.notes = data.notes;
		this.tags = data.tags;
		this.provider = data.provider ?? ManualCourseProvider.instance;
	}

	public static createFromSchema(data: Course.Schema): Course {
		const processedTags = data.tags
			?.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);

		return new Course({
			code: data.code,
			name: data.name,
			color: data.color,
			meetingTimes: data.meetingTimes.map(MeetingTime.createFromSchema),
			notes: data.notes,
			tags: processedTags,
		});
	}

	public addMeetingTime(meetingTime: MeetingTime): void {
		this.meetingTimes.push(meetingTime);
	}

	public removeMeetingTime(meetingTimeId: string): void {
		this.meetingTimes = this.meetingTimes.filter(
			(mt) => mt.id !== meetingTimeId,
		);
	}

	public updateMeetingTime(
		meetingTimeId: string,
		updates: Partial<MeetingTime>,
	): void {
		const index = this.meetingTimes.findIndex((mt) => mt.id === meetingTimeId);
		if (index !== -1) {
			Object.assign(this.meetingTimes[index], updates);
		}
	}

	public hasTimeConflictWith(other: Course): boolean {
		return this.meetingTimes.some((mt1) =>
			other.meetingTimes.some((mt2) => mt1.overlaps(mt2)),
		);
	}

	public isScheduledAt(day: number, time: Clock): boolean {
		return this.meetingTimes.some(
			(mt) =>
				mt.day === day &&
				time.isAfter(mt.time.start) &&
				time.isBefore(mt.time.end),
		);
	}

	public getMeetingTimeAt(day: number, time: Clock): MeetingTime | undefined {
		return this.meetingTimes.find(
			(mt) =>
				mt.day === day &&
				time.isAfter(mt.time.start) &&
				time.isBefore(mt.time.end),
		);
	}
}
