import { immerable } from "immer";
import z from "zod";
import { randomUUID } from "../utils";
import { Clock } from "./clock";
import { TimeRange } from "./time-range";

export interface CellStyleOverrides {
	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;
	borderStyle?: "solid" | "dashed" | "dotted";
	borderWidth?: number;
	opacity?: number;
}

const meetingTimeSchema = z.object({
	day: z.number().min(1).max(7),
	location: z.string().optional(),
	startTime: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
	endTime: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
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
	public styleOverrides?: CellStyleOverrides;

	constructor(data: {
		day: number;
		time: TimeRange;
		location?: string;
		description?: string;
		styleOverrides?: CellStyleOverrides;
	}) {
		this.id = randomUUID();
		this.day = data.day;
		this.time = data.time;
		this.location = data.location;
		this.description = data.description;
		this.styleOverrides = data.styleOverrides;
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

	public overlaps(other: MeetingTime): boolean {
		if (this.day !== other.day) return false;

		return (
			this.time.start.isSameOrBefore(other.time.end) &&
			this.time.end.isSameOrAfter(other.time.start)
		);
	}

	public getDurationInSlots(): number {
		const startHour = this.time.start.hour;
		const startMin = this.time.start.minute;
		const endHour = this.time.end.hour;
		const endMin = this.time.end.minute;

		const startTotalMin = startHour * 60 + startMin;
		const endTotalMin = endHour * 60 + endMin;

		return Math.ceil((endTotalMin - startTotalMin) / 30); // 30-minute slots
	}
}
