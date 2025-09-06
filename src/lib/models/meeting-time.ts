import { immerable } from "immer";
import z from "zod";
import { randomUUID } from "../utils/random";
import { type CellAppearance, CellAppearanceSchema } from "./cell-appearance";
import { Clock, TimeRange } from "./clock";

const meetingTimeSchema = z.object({
	day: z.number().min(1).max(7),
	location: z.string().optional(),
	startTime: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
	endTime: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
	cellAppearance: CellAppearanceSchema.partial().optional(),
});

export namespace MeetingTime {
	export type Schema = z.infer<typeof meetingTimeSchema>;
}

export class MeetingTime {
	[immerable] = true;

	public static schema = meetingTimeSchema;

	public id: string;
	public day: number;
	public time: TimeRange;
	public location?: string;
	public description?: string;
	public cellAppearance?: Partial<CellAppearance>;

	constructor(data: {
		day: number;
		time: TimeRange;
		location?: string;
		description?: string;
		cellAppearance?: Partial<CellAppearance>;
	}) {
		this.id = randomUUID();
		this.day = data.day;
		this.time = data.time;
		this.location = data.location;
		this.description = data.description;
		this.cellAppearance = data.cellAppearance;
	}

	public static createFromSchema(data: MeetingTime.Schema): MeetingTime {
		return new MeetingTime({
			day: data.day,
			time: new TimeRange(
				Clock.fromString(data.startTime),
				Clock.fromString(data.endTime),
			),
			location: data.location,
		});
	}

	public toSchema(): MeetingTime.Schema {
		return {
			day: this.day,
			startTime: this.time.start.toString(),
			endTime: this.time.end.toString(),
			location: this.location,
			cellAppearance: this.cellAppearance,
		};
	}

	public overlaps(other: MeetingTime): boolean {
		if (this.day !== other.day) return false;

		return (
			this.time.start.isBefore(other.time.end) &&
			this.time.end.isAfter(other.time.start)
		);
	}
}
