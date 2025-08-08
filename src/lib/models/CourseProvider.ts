import { randomUUID } from "../utils";
import type { Course } from "./Course";
import type { Time } from "./Time";

export abstract class CourseProvider {
	public id: string;
	public name: string;
	public displayName: string;
	public isActive: boolean;
	public courses: Course[];

	constructor(data: {
		name: string;
		displayName: string;
		isActive?: boolean;
		courses?: Course[];
		id?: string;
	}) {
		this.id = randomUUID();
		this.name = data.name;
		this.displayName = data.displayName;
		this.isActive = data.isActive ?? true;
		this.courses = data.courses || [];
	}

	public addCourse(course: Course): void {
		this.courses.push(course);
	}

	public removeCourse(courseId: string): void {
		this.courses = this.courses.filter((c) => c.id !== courseId);
	}

	public updateCourse(courseId: string, updates: Partial<Course>): void {
		const course = this.courses.find((c) => c.id === courseId);
		if (course) {
			Object.assign(course, updates);
		}
	}

	public getCourse(courseId: string): Course | undefined {
		return this.courses.find((c) => c.id === courseId);
	}

	public hasTimeConflict(newCourse: Course, excludeCourseId?: string): boolean {
		return this.courses.some((course) => {
			if (excludeCourseId && course.id === excludeCourseId) return false;
			return course.hasTimeConflictWith(newCourse);
		});
	}

	public getCoursesAt(day: number, time: Time): Course[] {
		return this.courses.filter((course) => course.isScheduledAt(day, time));
	}

	public abstract sync(): Promise<void>;
}
