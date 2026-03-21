// Set UITM_MOCK=true in your .env (or wrangler.jsonc vars) to use dummy data
// when the UiTM server is offline.
export const MOCK_MODE = import.meta.env.VITE_UITM_MOCK === "true";

// Simple seeded random to ensure consistent mock data for same inputs
function seededRandom(seed: string) {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash << 5) - hash + seed.charCodeAt(i);
		hash |= 0;
	}
	return () => {
		hash = (hash * 1664525 + 1013904223) | 0;
		return (hash >>> 0) / 4294967296;
	};
}

export const MOCK_CAMPUSES = [
	{ code: "B", name: "Shah Alam", requireFaculty: true },
	{ code: "KA", name: "Kota Bharu", requireFaculty: false },
	{ code: "ML", name: "Alor Gajah", requireFaculty: false },
	{ code: "NS", name: "Seremban", requireFaculty: false },
	{ code: "PP", name: "Arau", requireFaculty: false },
	{ code: "SA", name: "Sabah", requireFaculty: false },
	{ code: "SR", name: "Sarawak", requireFaculty: false },
	{ code: "J", name: "Jasin", requireFaculty: false },
	{ code: "D", name: "Dungun", requireFaculty: false },
];

export const MOCK_FACULTIES = [
	{
		code: "FSKM",
		name: "College of Computing, Informatics and Mathematics",
		requireFaculty: false,
	},
	{
		code: "FKE",
		name: "Faculty of Electrical Engineering",
		requireFaculty: false,
	},
	{
		code: "FPP",
		name: "Faculty of Business & Management",
		requireFaculty: false,
	},
	{ code: "FSG", name: "Faculty of Applied Sciences", requireFaculty: false },
	{
		code: "FSPU",
		name: "Faculty of Architecture, Planning & Surveying",
		requireFaculty: false,
	},
	{
		code: "FKM",
		name: "Faculty of Mechanical Engineering",
		requireFaculty: false,
	},
	{ code: "FKP", name: "Faculty of Pharmacy", requireFaculty: false },
];

const COURSE_PREFIXES = [
	"CSC",
	"MAT",
	"ICT",
	"ITS",
	"PHY",
	"CHM",
	"ELC",
	"CTU",
];
const COURSE_NAMES: Record<string, string> = {
	CSC: "Computer Programming",
	MAT: "Calculus",
	ICT: "Information Systems",
	ITS: "Network Security",
	PHY: "Physics",
	CHM: "Chemistry",
	ELC: "English for Communication",
	CTU: "Islamic Studies",
};

export function getMockCourses(campus: string, faculty?: string | null) {
	const rand = seededRandom(`${campus}-${faculty || "none"}`);
	const courses = [];
	const count = 15 + Math.floor(rand() * 20);

	for (let i = 0; i < count; i++) {
		const prefix = COURSE_PREFIXES[Math.floor(rand() * COURSE_PREFIXES.length)];
		const level = 100 + Math.floor(rand() * 600);
		const code = `${prefix}${level}`;

		courses.push({
			code,
			campusCode: campus,
			facultyCode: faculty || null,
			path: `mock/${code}`,
		});
	}

	return courses.sort((a, b) => a.code.localeCompare(b.code));
}

const ROOMS = ["BK-01", "BK-02", "BK-03", "DK-1", "DK-2", "LAB-A", "LAB-B"];
const MODES = ["F2F", "Online", "Hybrid"];
const STATUSES = ["Active", "Full", "Closed"];

export function getMockGroups(courseCode: string) {
	const rand = seededRandom(courseCode);
	const groups = [];
	const count = 3 + Math.floor(rand() * 8);

	for (let i = 0; i < count; i++) {
		const groupNum = 101 + i;
		const groupName = `${courseCode.slice(0, 3)}${groupNum}`;
		const sessionCount = 1 + Math.floor(rand() * 2);
		const sessions = [];

		const baseDay = 1 + Math.floor(rand() * 5);
		const baseStart = 8 + Math.floor(rand() * 8);

		for (let s = 0; s < sessionCount; s++) {
			const day = (baseDay + s * 2) % 6 || 1;
			const startHour = (baseStart + s) % 18;
			const endHour = startHour + 2;

			sessions.push({
				groupCode: groupName,
				day,
				start: `${startHour.toString().padStart(2, "0")}:00`,
				end: `${endHour.toString().padStart(2, "0")}:00`,
				mode: MODES[Math.floor(rand() * MODES.length)],
				status: STATUSES[Math.floor(rand() * 10) === 0 ? 1 : 0], // Mostly active
				room:
					rand() > 0.3 ? ROOMS[Math.floor(rand() * ROOMS.length)] : undefined,
			});
		}

		groups.push({
			code: groupName,
			sessions,
		});
	}

	return groups;
}

export function getMockStudentTimetable(studentId: string) {
	const rand = seededRandom(studentId);
	const coursesCount = 4 + Math.floor(rand() * 4);
	const timetable = [];

	// To create conflicts, we'll intentionally pick overlapping slots for some courses
	// if the studentId ends in a certain way
	const shouldConflict = studentId.endsWith("9");

	const selectedSlots: Array<{ day: number; start: number; end: number }> = [];

	for (let i = 0; i < coursesCount; i++) {
		const prefix = COURSE_PREFIXES[i % COURSE_PREFIXES.length];
		const code = `${prefix}${100 + i * 50}`;
		const name = `${COURSE_NAMES[prefix] || "Subject"} ${i + 1}`;
		const groupCode = `${prefix}1A${i}`;

		const sessions = [];
		const sessionCount = 1 + Math.floor(rand() * 2);

		for (let s = 0; s < sessionCount; s++) {
			let day: number, startHour: number, endHour: number;

			if (shouldConflict && i === 1 && s === 0 && selectedSlots.length > 0) {
				// Intentionally conflict with the first slot of the first course
				day = selectedSlots[0].day;
				startHour = selectedSlots[0].start;
				endHour = selectedSlots[0].end;
			} else {
				// Try to find a free slot or just generate one
				let attempts = 0;
				do {
					day = 1 + Math.floor(rand() * 5);
					startHour = 8 + Math.floor(rand() * 9);
					endHour = startHour + 2;
					attempts++;
					// If not trying to conflict, try to find a non-overlapping slot
				} while (
					!shouldConflict &&
					attempts < 10 &&
					selectedSlots.some(
						(slot) =>
							slot.day === day &&
							((startHour >= slot.start && startHour < slot.end) ||
								(endHour > slot.start && endHour <= slot.end)),
					)
				);
			}

			selectedSlots.push({ day, start: startHour, end: endHour });

			sessions.push({
				groupCode,
				day,
				start: `${startHour.toString().padStart(2, "0")}:00`,
				end: `${endHour.toString().padStart(2, "0")}:00`,
				room: ROOMS[Math.floor(rand() * ROOMS.length)],
				lecturer: `Dr. ${["Ali", "Abu", "Chong", "Muthu", "Siti", "Zarah"][Math.floor(rand() * 6)]}`,
			});
		}

		timetable.push({
			code: groupCode,
			courseName: name,
			courseCode: code,
			sessions,
		});
	}

	return timetable;
}
