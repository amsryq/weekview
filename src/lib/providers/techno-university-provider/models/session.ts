export class Session {
	groupCode: string;
	room?: string;
	day?: number;
	start?: string;
	end?: string;
	mode?: string;
	status?: string;

	constructor(
		groupCode: string,
		room?: string,
		day?: number,
		start?: string,
		end?: string,
		mode?: string,
		status?: string,
	) {
		this.groupCode = groupCode;
		this.room = room;
		this.day = day;
		this.start = start;
		this.end = end;
		this.mode = mode;
		this.status = status;
	}
}
