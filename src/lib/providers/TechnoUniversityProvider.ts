import { Course } from "../models/Course";
import { CourseProvider } from "../models/CourseProvider";
import { MeetingTime } from "../models/MeetingTime";
import { Time } from "../models/Time";
import { TimeRange } from "../models/TimeRange";

export interface TechnoUniversityImportData {
	courseCodes: string[];
	studentGroup?: string;
}

export interface TechnoUniversityCourseData {
	name: string;
	code: string;
	meetingTimes: {
		day: number;
		time: TimeRange;
		location?: string;
		description?: string;
	}[];
}

export class TechnoUniversityProvider extends CourseProvider {
	public lastSyncAt?: Date;

	constructor(data: {
		lastSyncAt?: Date;
		isActive?: boolean;
	}) {
		super({
			name: `techno-university`,
			displayName: "Techno University",
			isActive: data.isActive,
		});

		this.lastSyncAt = data.lastSyncAt;
	}

	public async importCourses(
		importData: TechnoUniversityImportData,
	): Promise<Course[]> {
		// Simulate API call to TechnoUniversity
		const response = await this.fetchFromTechnoUniversity(importData);

		// Convert API response to Course objects
		const courses = response.map((courseData) => {
			const meetingTimes = courseData.meetingTimes.map(
				(mt) =>
					new MeetingTime({
						day: mt.day,
						time: mt.time,
						location: mt.location,
						description: mt.description,
					}),
			);

			return new Course({
				name: courseData.name,
				code: courseData.code,
				color: this.generateCourseColor(),
				meetingTimes,
				isSynced: true,
			});
		});

		return courses;
	}

	private async fetchFromTechnoUniversity(
		importData: TechnoUniversityImportData,
	): Promise<TechnoUniversityCourseData[]> {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Mock data based on course codes
		const mockCourses: TechnoUniversityCourseData[] = [];

		for (const code of importData.courseCodes) {
			if (code.toUpperCase() === "CS101") {
				mockCourses.push({
					name: "Introduction to Computer Science",
					code: "CS101",
					meetingTimes: [
						{
							day: 1,
							time: new TimeRange(new Time(9, 0), new Time(10, 30)),
							location: "Room A101",
							description: "Lecture",
						},
						{
							day: 3,
							time: new TimeRange(new Time(14, 0), new Time(15, 30)),
							location: "Lab B205",
							description: "Lab Session",
						},
					],
				});
			} else if (code.toUpperCase() === "MA203") {
				mockCourses.push({
					name: "Calculus II",
					code: "MA203",
					meetingTimes: [
						{
							day: 2,
							time: new TimeRange(new Time(10, 0), new Time(11, 30)),
							location: "Room C301",
						},
						{
							day: 4,
							time: new TimeRange(new Time(10, 0), new Time(11, 30)),
							location: "Room C301",
						},
					],
				});
			} else if (code.toUpperCase() === "PH150") {
				mockCourses.push({
					name: "Physics I",
					code: "PH150",
					meetingTimes: [
						{
							day: 1,
							time: new TimeRange(new Time(14, 0), new Time(15, 30)),
							location: "Room D102",
						},
						{
							day: 5,
							time: new TimeRange(new Time(9, 0), new Time(10, 30)),
							location: "Lab E201",
						},
					],
				});
			}
		}

		return mockCourses;
	}

	private generateCourseColor(): string {
		const colors = [
			"#3b82f6",
			"#ef4444",
			"#10b981",
			"#f59e0b",
			"#8b5cf6",
			"#ec4899",
			"#06b6d4",
			"#84cc16",
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}

	public async sync(): Promise<void> {
		console.log(`Syncing courses from ${this.displayName}...`);
		// In a real implementation, this would re-fetch all synced courses
		this.lastSyncAt = new Date();
	}
}
