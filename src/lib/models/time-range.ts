import type { Clock } from "./clock";

export class TimeRange {
	public start: Clock;
	public end: Clock;

	constructor(start: Clock, end: Clock) {
		this.start = start;
		this.end = end;
	}
}
