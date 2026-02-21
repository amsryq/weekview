import { immerable } from "immer";
import z from "zod";
import { ManualCourseProvider } from "../providers/manual-course-provider";
import { randomUUID } from "../utils/random";
import { type CellAppearance, CellAppearanceSchema } from "./cell-appearance";
import type { CourseProvider } from "./course-provider";
import { MeetingTime } from "./meeting-time";

type CourseConstructorProps = {
	code: string;
	meetingTimes: MeetingTime[];
	name?: string;
	provider?: CourseProvider;
	cellAppearance: CellAppearance;
	themeColorIndex?: number | null;
};

const courseSchema = z.object({
	code: z.string().min(1, "Course code is required"),
	meetingTimes: z
		.array(MeetingTime.schema)
		.min(1, "At least one meeting time is required"),
	name: z.string().optional(),
	cellAppearance: CellAppearanceSchema,
	themeColorIndex: z.number().nullable().optional(),
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
	public cellAppearance: CellAppearance;
	public themeColorIndex: number | null;

	public provider: CourseProvider;
	public syncStatus: Course.SyncStatus = "synced";

	constructor(data: CourseConstructorProps) {
		this.id = randomUUID();
		this.code = data.code;
		this.name = data.name;
		this.meetingTimes = data.meetingTimes || [];
		this.cellAppearance = data.cellAppearance;
		this.themeColorIndex = data.themeColorIndex ?? null;
		this.provider = data.provider ?? ManualCourseProvider.instance;
	}

	public static createFromSchema(data: Course.Schema): Course {
		return new Course({
			code: data.code,
			name: data.name,
			meetingTimes: data.meetingTimes.map(MeetingTime.createFromSchema),
			cellAppearance: data.cellAppearance,
			themeColorIndex: data.themeColorIndex,
		});
	}

	public toSchema(): Course.Schema {
		return {
			code: this.code,
			name: this.name,
			meetingTimes: this.meetingTimes.map((mt) => mt.toSchema()),
			cellAppearance: this.cellAppearance,
			themeColorIndex: this.themeColorIndex,
		};
	}

	public static assignFromSchema(target: Course, data: Course.Schema): void {
		target.code = data.code;
		target.name = data.name;
		target.meetingTimes = data.meetingTimes.map(MeetingTime.createFromSchema);
		target.cellAppearance = data.cellAppearance;
		target.themeColorIndex = data.themeColorIndex ?? null;
	}
}
