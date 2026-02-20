// Set UITM_MOCK=true in your .env (or wrangler.jsonc vars) to use dummy data
// when the UiTM server is offline.
export const MOCK_MODE = process.env.UITM_MOCK === "true";

export const MOCK_CAMPUSES = [
    { code: "B", name: "Shah Alam", requireFaculty: true },
    { code: "KA", name: "Kota Bharu", requireFaculty: false },
    { code: "ML", name: "Alor Gajah", requireFaculty: false },
    { code: "NS", name: "Seremban", requireFaculty: false },
    { code: "PP", name: "Arau", requireFaculty: false },
    { code: "SA", name: "Sabah", requireFaculty: false },
    { code: "SR", name: "Sarawak", requireFaculty: false },
];

export const MOCK_FACULTIES = [
    { code: "CS", name: "Faculty of Computer & Mathematical Sciences", requireFaculty: false },
    { code: "EE", name: "Faculty of Electrical Engineering", requireFaculty: false },
    { code: "BE", name: "Faculty of Business & Management", requireFaculty: false },
    { code: "AP", name: "Faculty of Applied Sciences", requireFaculty: false },
    { code: "AR", name: "Faculty of Architecture, Planning & Surveying", requireFaculty: false },
];

export const MOCK_COURSES = [
    { code: "CS220", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/CS220" } },
    { code: "CS230", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/CS230" } },
    { code: "CS250", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/CS250" } },
    { code: "CS260", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/CS260" } },
    { code: "MAT183", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/MAT183" } },
    { code: "PHY310", campusCode: "B", facultyCode: "CS", __internal: { path: "mock/PHY310" } },
];

export const MOCK_GROUPS = [
    {
        code: "CS220-CS2401A",
        sessions: [
            { groupCode: "CS220-CS2401A", day: 1, start: "08:00", end: "10:00", mode: "F2F", status: "Active", room: "BK-01-01" },
            { groupCode: "CS220-CS2401A", day: 3, start: "14:00", end: "16:00", mode: "F2F", status: "Active", room: "BK-01-01" },
        ],
    },
    {
        code: "CS220-CS2401B",
        sessions: [
            { groupCode: "CS220-CS2401B", day: 2, start: "10:00", end: "12:00", mode: "F2F", status: "Active", room: "BK-02-03" },
            { groupCode: "CS220-CS2401B", day: 4, start: "08:00", end: "10:00", mode: "F2F", status: "Active", room: "BK-02-03" },
        ],
    },
    {
        code: "CS220-CS2401C",
        sessions: [
            { groupCode: "CS220-CS2401C", day: 1, start: "14:00", end: "16:00", mode: "Online", status: "Active", room: undefined },
            { groupCode: "CS220-CS2401C", day: 5, start: "10:00", end: "12:00", mode: "Online", status: "Active", room: undefined },
        ],
    },
];

export const MOCK_STUDENT_TIMETABLE = [
    {
        code: "CS2401A",
        courseName: "Data Structures",
        courseCode: "CS220",
        sessions: [
            { groupCode: "CS2401A", day: 1, start: "08:00", end: "10:00", room: "BK-01-01", lecturer: "Dr. Ahmad" },
            { groupCode: "CS2401A", day: 3, start: "14:00", end: "16:00", room: "BK-01-01", lecturer: "Dr. Ahmad" },
        ],
    },
    {
        code: "EE2401B",
        courseName: "Circuit Analysis",
        courseCode: "EE230",
        sessions: [
            { groupCode: "EE2401B", day: 2, start: "10:00", end: "12:00", room: "EE-Lab-1", lecturer: "Prof. Siti" },
        ],
    },
    {
        code: "MAT2401A",
        courseName: "Calculus II",
        courseCode: "MAT183",
        sessions: [
            { groupCode: "MAT2401A", day: 4, start: "08:00", end: "10:00", room: "DK-3", lecturer: "Dr. Lim" },
            { groupCode: "MAT2401A", day: 5, start: "12:00", end: "14:00", room: "DK-3", lecturer: "Dr. Lim" },
        ],
    },
];
