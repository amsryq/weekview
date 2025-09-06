interface ServerCampus {
	code: string;
	name: string;
	requireFaculty?: boolean;
}

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
		const data: ServerCampus[] = await fetch(
			"/api/providers/uitm/icress/campuses",
		).then((r) => r.json());
		return data.map((c) => new Campus(c.code, c.name, c.requireFaculty));
	}
}
