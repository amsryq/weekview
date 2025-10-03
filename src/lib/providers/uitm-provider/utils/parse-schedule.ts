export interface CampusInfo {
	code: string;
	name: string;
}

export interface FacultyInfo {
	code: string;
	name: string;
}

export interface CourseInfo {
	courseCode: string;
	name: string;
	group: string;
}

export interface ScheduleInfo {
	campus: CampusInfo | null;
	faculty: FacultyInfo | null;
	courses: CourseInfo[];
}

export function parseSchedule(rawText: string): ScheduleInfo {
	const campusMatch = rawText.match(
		/Campus\s*:\s*\n\s*([A-Z0-9]+)\s*-\s*([^\n]+)/,
	);
	const campus: CampusInfo | null = campusMatch
		? { code: campusMatch[1].trim(), name: campusMatch[2].trim() }
		: null;

	const facultyMatch = rawText.match(
		/Faculty\s*:\s*\n\s*([A-Z\s]+)\s*-\s*([^\n]+)/,
	);
	const faculty: FacultyInfo | null = facultyMatch
		? { code: facultyMatch[1].trim(), name: facultyMatch[2].trim() }
		: null;

	const courses: CourseInfo[] = [];
	const courseListStartIndex = rawText.indexOf("1.");

	if (courseListStartIndex !== -1) {
		const creditUnitIndex = rawText.indexOf("Total Credit Unit");
		const courseListText =
			creditUnitIndex !== -1
				? rawText.substring(courseListStartIndex, creditUnitIndex)
				: rawText.substring(courseListStartIndex);

		const courseChunks = courseListText.split(/\s*(?=\d+\.)/);
		const courseRegex =
			/^\d+\.\s+([A-Z0-9]+)\s+-\s+(.+?)\s+-\s+([A-Z])\s+(\d+)\s+(\d+)\s+([A-Z0-9]+)$/;

		for (const chunk of courseChunks) {
			if (chunk.trim() === "") continue;

			const singleLineChunk = chunk
				.replace(/[\n\t]/g, " ")
				.replace(/\s+/g, " ")
				.trim();
			const match = singleLineChunk.match(courseRegex);

			if (match) {
				courses.push({
					courseCode: match[1],
					name: match[2],
					group: match[6],
				});
			} else {
				console.warn(`Could not parse course chunk: "${singleLineChunk}"`);
			}
		}
	}

	return { campus, faculty, courses };
}
