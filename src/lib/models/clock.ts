import { immerable } from "immer";

export class Clock {
	[immerable] = true;

	public hour: number;
	public minute: number;

	constructor(hour: number, minute: number) {
		this.hour = hour;
		this.minute = minute;
	}

	/**
	 * Parses a time string in the format "HH:mm" and returns a Time object.
	 * @param timeStr The time string to parse.
	 * @returns A Time object representing the parsed time.
	 */
	public static fromString(timeStr: string): Clock {
		const [hour, minute] = timeStr.split(":").map(Number);
		return new Clock(hour, minute);
	}

	public isAfter(other: Clock): boolean {
		if (this.hour !== other.hour) {
			return this.hour > other.hour;
		}
		return this.minute > other.minute;
	}

	public isBefore(other: Clock): boolean {
		if (this.hour !== other.hour) {
			return this.hour < other.hour;
		}
		return this.minute < other.minute;
	}

	public toString(): string {
		return `${this.hour.toString().padStart(2, "0")}:${this.minute.toString().padStart(2, "0")}`;
	}
}
