import { faker } from "@faker-js/faker";

const CourseSymbol = Symbol("course");

export interface Campus {
	code: string;
	name: string;
	// Determines if faculty selection is mandatory for this campus.
	// Faculty info is usually not needed by UiTM for timetable purposes.
	requireFaculty?: boolean;
}

export interface Faculty {
	code: string;
	name: string;
	campusCode: string;
}

export interface Course {
	code: string;
	name: string;
	campusCode: string;
	facultyCode: string | null; // null if not applicable
	__internal: {
		path: string;
	};
}

export interface Group {
	code: string;
	sessions: Session[];
	[CourseSymbol]?: Course;
}

export interface Session {
	groupCode: string;
	room?: string;
	day: number; // 1: Monday, 2: Tuesday, ..., 7: Sunday
	start: string; // HH:mm format
	end: string; // HH:mm format
	mode: "Online" | "In-Person" | "Hybrid" | "Blended";
	status: "Scheduled" | "Cancelled" | "Rescheduled" | "Pending";
}

// 1. Define Campuses
const campuses: Campus[] = [
	{ code: "B", name: "Puncak Alam Main Campus", requireFaculty: true },
	{ code: "A", name: "Shah Alam City Campus", requireFaculty: true },
	{ code: "C", name: "Pulau Pinang Branch (Bertam)", requireFaculty: true },
	{ code: "D", name: "Johor Branch (Segamat)", requireFaculty: true },
	{ code: "J", name: "Melaka Branch (Jasin)", requireFaculty: true },
	{ code: "P", name: "Perak Branch (Seri Iskandar)", requireFaculty: true },
	{ code: "S", name: "Sabah Branch (Kota Kinabalu)", requireFaculty: true },
	{
		code: "CITU",
		name: "Center for Islamic Thought & Understanding",
		requireFaculty: false,
	},
	{ code: "APB", name: "Academy of Language Studies", requireFaculty: false },
];

// 2. Define a Master List of Potential Faculties
const masterFaculties = [
	{ code: "AC", name: "Accountancy" },
	{ code: "AP", name: "Architecture, Planning & Surveying" },
	{ code: "BM", name: "Business & Management" },
	{ code: "CS", name: "Computer & Mathematical Sciences" },
	{ code: "EH", name: "Electrical Engineering" },
	{ code: "AS", name: "Applied Sciences" },
	{ code: "FT", name: "Film, Theatre & Animation" },
	{ code: "HS", name: "Health Sciences" },
	{ code: "LW", name: "Law" },
	{ code: "MD", name: "Medicine" },
];

// 3. Assign Faculties to Campuses
// Not all campuses will have all faculties, making it more realistic.
const faculties: Faculty[] = [];
campuses.forEach((campus) => {
	if (campus.requireFaculty) {
		// Assign a subset of master faculties to each campus
		const numFaculties = faker.number.int({ min: 3, max: 6 });
		faker.helpers
			.shuffle(masterFaculties)
			.slice(0, numFaculties)
			.forEach((faculty) => {
				faculties.push({ ...faculty, campusCode: campus.code });
			});
	}
});

// 4. Generate Courses, Groups, and Sessions in a structured way
const courses: Course[] = [];
const groups: Group[] = [];

// Helper data for course generation
const coursePrefixes: { [key: string]: { prefix: string; name: string }[] } = {
	AC: [
		{ prefix: "ACC", name: "Accounting" },
		{ prefix: "AUD", name: "Auditing" },
	],
	AP: [
		{ prefix: "ARC", name: "Architecture" },
		{ prefix: "BSV", name: "Building Surveying" },
	],
	BM: [
		{ prefix: "MGT", name: "Management" },
		{ prefix: "MKT", name: "Marketing" },
		{ prefix: "FIN", name: "Finance" },
	],
	CS: [
		{ prefix: "CSC", name: "Computer Science" },
		{ prefix: "MAT", name: "Mathematics" },
		{ prefix: "STA", name: "Statistics" },
	],
	EH: [
		{ prefix: "EEE", name: "Electrical Engineering" },
		{ prefix: "ECE", name: "Electronics Engineering" },
	],
	AS: [
		{ prefix: "BIO", name: "Biology" },
		{ prefix: "CHM", name: "Chemistry" },
		{ prefix: "PHY", name: "Physics" },
	],
	FT: [
		{ prefix: "FTA", name: "Animation" },
		{ prefix: "FTT", name: "Theatrical Studies" },
	],
	HS: [
		{ prefix: "NUR", name: "Nursing" },
		{ prefix: "OPT", name: "Optometry" },
	],
	LW: [{ prefix: "LAW", name: "Law" }],
	MD: [{ prefix: "MED", name: "Medical Science" }],
};

// Generate faculty-specific courses
faculties.forEach((faculty) => {
	const numCourses = faker.number.int({ min: 5, max: 15 });
	const prefixes = coursePrefixes[faculty.code] || [
		{ prefix: "GEN", name: "General" },
	];

	for (let i = 0; i < numCourses; i++) {
		const selectedPrefix = faker.helpers.arrayElement(prefixes);
		const courseCode = `${selectedPrefix.prefix}${faker.number.int({ min: 101, max: 699 })}`;
		const courseName = `${selectedPrefix.name} ${faker.hacker.noun().replace(/^./, (c) => c.toUpperCase())}`;

		const course: Course = {
			code: courseCode,
			name: courseName,
			campusCode: faculty.campusCode,
			facultyCode: faculty.code,
			__internal: { path: `${faculty.code}/${courseCode}` },
		};
		courses.push(course);

		// For each course, create groups and sessions
		const numGroups = faker.number.int({ min: 1, max: 4 });
		for (let j = 0; j < numGroups; j++) {
			const groupCode = `${courseCode}-${String.fromCharCode(65 + j)}`; // e.g., CSC404-A

			const lectureDay = faker.number.int({ min: 1, max: 5 });
			const lectureStartHour = faker.number.int({ min: 8, max: 16 });

			const lectureSession: Session = {
				groupCode,
				room: `DKG ${faker.number.int({ min: 1, max: 10 })}`, // Dewan Kuliah Gabungan
				day: lectureDay,
				start: `${String(lectureStartHour).padStart(2, "0")}:00`,
				end: `${String(lectureStartHour + 2).padStart(2, "0")}:00`,
				mode: faker.helpers.arrayElement(["In-Person", "Hybrid", "Blended"]),
				status: faker.helpers.arrayElement([
					"Scheduled",
					"Scheduled",
					"Scheduled",
					"Rescheduled",
				]),
			};

			const labOrTutorialDay = (lectureDay % 5) + 1; // Different day from lecture
			const labStartHour = faker.number.int({ min: 8, max: 17 });
			const isLab = ["CSC", "EEE", "BIO", "CHM", "PHY"].includes(
				selectedPrefix.prefix,
			);

			const secondarySession: Session = {
				groupCode,
				room: isLab
					? `Makmal ${selectedPrefix.prefix} ${j + 1}`
					: `BT ${faker.number.int({ min: 1, max: 20 })}`, // Bilik Tutorial
				day: labOrTutorialDay,
				start: `${String(labStartHour).padStart(2, "0")}:00`,
				end: `${String(labStartHour + 1).padStart(2, "0")}:00`,
				mode: "In-Person",
				status: "Scheduled",
			};

			const group: Group = {
				code: groupCode,
				[CourseSymbol]: course,
				sessions: [lectureSession, secondarySession],
			};
			groups.push(group);
		}
	}
});

// Generate non-faculty (university-wide) courses
campuses
	.filter((c) => !c.requireFaculty)
	.forEach((campus) => {
		const uniCourses = [
			{ code: "HBU111", name: "National Kesatria I" },
			{ code: "TAC401", name: "Introductory Arabic I" },
			{ code: "ELS101", name: "English for Communication" },
		];
		uniCourses.forEach((uniCourse, i) => {
			const course: Course = {
				...uniCourse,
				campusCode: campus.code,
				facultyCode: null,
				__internal: { path: `${campus.code}/${uniCourse.code}` },
			};
			courses.push(course);

			// Create groups for this university course
			const group: Group = {
				code: `${uniCourse.code}-A${i + 1}`,
				[CourseSymbol]: course,
				sessions: [
					{
						groupCode: `${uniCourse.code}-A${i + 1}`,
						day: faker.number.int({ min: 1, max: 5 }),
						start: "14:00",
						end: "16:00",
						mode: "In-Person",
						status: "Scheduled",
					},
				],
			};
			groups.push(group);
		});
	});

// --- MOCK API ---

function fakeFetch<T>(data: T, delay = 300): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

export const api = {
	getCampuses: () => fakeFetch(campuses),

	getFaculties: (campusCode: string) =>
		fakeFetch(faculties.filter((f) => f.campusCode === campusCode)),

	getCourses: (campusCode: string, facultyCode?: string) =>
		fakeFetch(
			courses.filter((c) => {
				// If faculty is required, both campus and faculty must match
				const campusInfo = campuses.find((cam) => cam.code === campusCode);
				if (campusInfo?.requireFaculty) {
					return c.campusCode === campusCode && c.facultyCode === facultyCode;
				}
				// If faculty is not required, only campus needs to match
				return c.campusCode === campusCode;
			}),
		),

	getGroups: (path: string) =>
		fakeFetch(groups.filter((g) => g[CourseSymbol]?.__internal.path === path)),
};
