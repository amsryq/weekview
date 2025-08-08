import type { Time } from "./Time";

export class TimeRange {
	public start: Time;
	public end: Time;

	constructor(start: Time, end: Time) {
		this.start = start;
		this.end = end;
	}
}
