import type {
	Campus,
	Course,
	Group,
	Session,
	StudentGroup,
} from "@weekview/uitm-scraper";

export type { Campus, Course, Group, Session };
export type MyStudentGroup = StudentGroup;

export interface Faculty {
	code: string;
	name: string;
	campusCode: string;
}

export type MyStudentSession = Session;
