import { immerable } from "immer";
import z from "zod";
import { ManualCourseProvider } from "../providers/manual-course-provider";
import { randomUUID } from "../utils";
import { type CellAppearance, CellAppearanceSchema } from "./cell-appearance";
import type { Clock } from "./clock";
import type { CourseProvider } from "./course-provider";
import { MeetingTime } from "./meeting-time";

type CourseConstructorProps = {
	code: string;
	meetingTimes: MeetingTime[];
	name?: string;
	provider?: CourseProvider;
	cellAppearance?: Partial<CellAppearance>;
};

const courseSchema = z.object({
	code: z.string().min(1, "Course code is required"),
	meetingTimes: z
		.array(MeetingTime.schema)
		.min(1, "At least one meeting time is required"),
	name: z.string().optional(),
	cellAppearance: CellAppearanceSchema.optional(),
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
	public name?: string;
	public meetingTimes: MeetingTime[];
	public cellAppearance?: Partial<CellAppearance>;

	public provider: CourseProvider;
	public syncStatus: Course.SyncStatus = "synced";

	constructor(data: CourseConstructorProps) {
		this.id = randomUUID();
		this.code = data.code;
		this.name = data.name;
		this.meetingTimes = data.meetingTimes || [];
		this.cellAppearance = data.cellAppearance;
		this.provider = data.provider ?? ManualCourseProvider.instance;
	}

	public static createFromSchema(data: Course.Schema): Course {
		return new Course({
			code: data.code,
			name: data.name,
			meetingTimes: data.meetingTimes.map(MeetingTime.createFromSchema),
			cellAppearance: data.cellAppearance,
		});
	}

	public toSchema(): Course.Schema {
		return {
			code: this.code,
			name: this.name,
			meetingTimes: this.meetingTimes.map((mt) => mt.toSchema()),
			cellAppearance: this.cellAppearance,
		};
	}

	public static assignFromSchema(target: Course, data: Course.Schema): void {
		target.code = data.code;
		target.name = data.name;
		target.meetingTimes = data.meetingTimes.map(MeetingTime.createFromSchema);
		target.cellAppearance = data.cellAppearance as
			| Partial<CellAppearance>
			| undefined;
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
