import { CourseProvider } from "../models/course-provider";

let singletonCache: ManualCourseProvider | null = null;

export class ManualCourseProvider extends CourseProvider {
	constructor() {
		super({ name: "Manual Entry" });
	}

	static get instance(): ManualCourseProvider {
		return (singletonCache ??= new ManualCourseProvider());
	}

	public async sync(): Promise<void> {
		// Manual sources don't sync - they're user-managed
		return Promise.resolve();
	}
}
