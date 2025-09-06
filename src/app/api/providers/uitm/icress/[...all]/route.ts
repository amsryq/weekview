import { api } from "./mock";

/*
 * ICRESS Mock API Routes
 *
 * GET /api/providers/uitm/icress/campuses - Get all campuses
 * GET /api/providers/uitm/icress/faculties/{campusCode} - Get faculties for campus
 * GET /api/providers/uitm/icress/courses/{campusCode}/{facultyCode?} - Get courses for faculty
 * GET /api/providers/uitm/icress/groups/{courseCode} - Get groups for course
 */

export const GET = async (
	request: Request,
	{ params }: { params: Promise<{ all: string[] }> },
) => {
	const { all } = await params;

	if (!all || all.length === 0) {
		return new Response("ICRESS API is running");
	}

	const path = all[0];

	switch (path) {
		case "campuses": {
			const campuses = await api.getCampuses();
			return Response.json(campuses);
		}

		case "faculties": {
			if (all.length < 2) {
				return new Response("Campus code required", { status: 400 });
			}
			const code = all[1];
			const faculties = await api.getFaculties(code);
			return Response.json(faculties);
		}

		case "courses": {
			if (all.length < 2) {
				return new Response("Campus and/or Faculty code required", {
					status: 400,
				});
			}

			const [, campusCode, facultyCode] = all;
			const courses = await api.getCourses(campusCode, facultyCode);
			return Response.json(courses);
		}

		case "groups": {
			if (all.length < 2) {
				return new Response("Internal path required", { status: 400 });
			}
			const path = all.slice(1).join("/");
			const groups = await api.getGroups(path);
			return Response.json(groups);
		}

		default:
			return new Response("Not found", { status: 404 });
	}
};
