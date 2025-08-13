import { immerable } from "immer";
import { randomUUID } from "../utils";
import type { TimeRange } from "./time-range";

export interface CellStyleOverrides {
	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;
	borderStyle?: "solid" | "dashed" | "dotted";
	borderWidth?: number;
	opacity?: number;
}

export class MeetingTime {
	[immerable] = true;

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
		id?: string;
	}) {
		this.id = data.id || randomUUID();
		this.day = data.day;
		this.time = data.time;
		this.location = data.location;
		this.description = data.description;
		this.styleOverrides = data.styleOverrides;
	}

	public overlaps(other: MeetingTime): boolean {
		if (this.day !== other.day) return false;

		return (
			(this.time.start.isAfter(other.time.start) &&
				this.time.start.isBefore(other.time.end)) ||
			(this.time.end.isAfter(other.time.start) &&
				this.time.end.isBefore(other.time.end)) ||
			(this.time.start.isBefore(other.time.start) &&
				this.time.end.isAfter(other.time.end))
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
