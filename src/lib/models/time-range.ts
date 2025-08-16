import { immerable } from "immer";
import type { Clock } from "./clock";

export class TimeRange {
	[immerable] = true;

	public start: Clock;
	public end: Clock;

	constructor(start: Clock, end: Clock) {
		this.start = start;
		this.end = end;
	}

	public toString(): string {
		return `${this.start.toString()} - ${this.end.toString()}`;
	}
}
