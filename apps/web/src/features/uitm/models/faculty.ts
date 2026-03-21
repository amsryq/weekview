import { getCampuses } from "../server/functions";
import { Campus } from "./campus";

export class Faculty {
	code: string;
	name: string;
	campus: Campus;

	constructor(code: string, name: string, campus: Campus) {
		this.code = code;
		this.name = name;
		this.campus = campus;
	}

	static async fetch(campus: Campus): Promise<Faculty[]> {
		const data = await getCampuses({ data: "faculty" });
		return data.map((f) => new Faculty(f.code, f.name, campus));
	}
}
