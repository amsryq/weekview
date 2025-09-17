import { fetchFromBackend } from "~/lib/utils/backend";
import { Campus } from "./campus";

interface ServerFaculty {
	code: string;
	name: string;
	campusCode: string;
}

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
		const data: ServerFaculty[] = await fetchFromBackend(
			`/providers/uitm/icress/faculties/${campus.code}`,
		).then((r) => r.json());
		return data.map((f) => new Faculty(f.code, f.name, campus));
	}
}
