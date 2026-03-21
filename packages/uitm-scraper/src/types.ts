import type { CookieJar } from "tough-cookie";

export interface Clock {
	hour: number;
	minute: number;
}

export interface RootScrapsSet {
	tokens: Record<string, string>;
	indexResultLocation: string | null;
	campusSelectLocation: string | null;
	facultySelectLocation: string | null;
}

export interface MyStudentAPIResponse {
	[date: string]: null | {
		hari: string;
		jadual: Array<{
			course_desc: string;
			courseid: string;
			groups: string;
			masa: string;
			bilik: string | null;
			lecturer: string;
		}>;
	};
}

export interface StorageAdapter {
	get(key: string): Promise<string | null>;
	set(key: string, value: string, ttlSeconds?: number): Promise<void>;
	delete(key: string): Promise<void>;
}

export interface Campus {
	code: string;
	name: string;
	requireFaculty: boolean;
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

export interface StudentGroup {
	code: string;
	courseName: string;
	courseCode: string;
	sessions: Session[];
}

export interface ScraperConfig {
	storage: StorageAdapter;
}
