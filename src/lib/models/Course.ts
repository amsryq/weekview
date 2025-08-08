import { randomUUID } from "../utils";
import type { MeetingTime } from "./MeetingTime";
import type { Time } from "./Time";

export class Course {
	public id: string;
	public code: string;
	public name: string;
	public color: string;
	public meetingTimes: MeetingTime[];
	public notes?: string;
	public tags?: string[];
	public isSynced: boolean;

	constructor(data: {
		code: string;
		name: string;
		color: string;
		meetingTimes?: MeetingTime[];
		notes?: string;
		tags?: string[];
		isSynced?: boolean;
		id?: string;
	}) {
		this.id = data.id || randomUUID();
		this.code = data.code;
		this.name = data.name;
		this.color = data.color;
		this.meetingTimes = data.meetingTimes || [];
		this.notes = data.notes;
		this.tags = data.tags;
		this.isSynced = data.isSynced || false;
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

	public isScheduledAt(day: number, time: Time): boolean {
		return this.meetingTimes.some(
			(mt) =>
				mt.day === day &&
				time.isAfter(mt.time.start) &&
				time.isBefore(mt.time.end),
		);
	}

	public getMeetingTimeAt(day: number, time: Time): MeetingTime | undefined {
		return this.meetingTimes.find(
			(mt) =>
				mt.day === day &&
				time.isAfter(mt.time.start) &&
				time.isBefore(mt.time.end),
		);
	}
}
