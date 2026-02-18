import { getCampuses } from "~/server/functions/uitm";

export class Campus {
	code: string;
	name: string;
	requireFaculty?: boolean;

	constructor(code: string, name: string, requireFaculty?: boolean) {
		this.code = code;
		this.name = name;
		this.requireFaculty = requireFaculty;
	}

	static async fetch(): Promise<Campus[]> {
		const data = await getCampuses({ data: "campus" });
		return data.map((c) => new Campus(c.code, c.name, c.requireFaculty));
	}
}
