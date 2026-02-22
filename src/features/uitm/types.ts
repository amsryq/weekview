export interface Campus {
	code: string;
	name: string;
	requireFaculty?: boolean;
}

export interface Faculty {
	code: string;
	name: string;
	campusCode: string;
}

export interface Course {
	code: string;
	campusCode: string;
	facultyCode: string | null;
	__internal: {
		path: string;
	};
}

export interface Session {
	groupCode: string;
	room?: string;
	day: number;
	start: string;
	end: string;
	lecturer?: string;
	mode?: string;
	status?: string;
}

export interface Group {
	code: string;
	sessions: Session[];
}

export interface MyStudentSession {
	groupCode: string;
	room?: string;
	day: number;
	start: string;
	end: string;
	lecturer?: string;
}

export interface MyStudentGroup {
	code: string;
	courseName: string;
	courseCode: string;
	sessions: MyStudentSession[];
}
