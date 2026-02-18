import { getCourses } from "~/server/functions/uitm";
import { Campus } from "./campus";
import { Faculty } from "./faculty";

interface ServerCourse {
	code: string;
	facultyCode: string;
	__internal: {
		path: string;
	};
}

export class Course {
	code: string;
	campus: Campus;
	faculty?: Faculty;
	__path: string;

	constructor(code: string, path: string, campus: Campus, faculty?: Faculty) {
		this.code = code;
		this.__path = path;
		this.campus = campus;
		this.faculty = faculty;
	}

	static async fetch(campusOrFaculty: Campus | Faculty): Promise<Course[]> {
		const campus =
			campusOrFaculty instanceof Faculty
				? campusOrFaculty.campus
				: campusOrFaculty;
		const faculty =
			campusOrFaculty instanceof Faculty ? campusOrFaculty : undefined;

		const data = await getCourses({
			data: { campus: campus.code, faculty: faculty?.code },
		});

		return data.map(
			(c) => new Course(c.code, c.__internal.path, campus, faculty),
		);
	}
}
