import { CourseProvider } from "~/lib/models/course-provider";
import { TimeRange } from "~/lib/models/time-range";

export interface TechnoUniversityImportData {
	courseCodes: string[];
	studentGroup: string;
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

let singletonCache: TechnoUniversityProvider | null = null;

export class TechnoUniversityProvider extends CourseProvider {
	constructor() {
		super({
			name: `Techno University`,
		});
	}

	public static get instance(): TechnoUniversityProvider {
		return (singletonCache ??= new TechnoUniversityProvider());
	}

	public sync(): Promise<void> {
		return Promise.resolve();
	}
}
