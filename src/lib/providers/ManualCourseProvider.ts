import { CourseProvider } from "../models/CourseProvider";

export class ManualCourseProvider extends CourseProvider {
	constructor() {
		super({
			name: "manual",
			displayName: "Manual Entry",
		});
	}

	public async sync(): Promise<void> {
		// Manual sources don't sync - they're user-managed
		return Promise.resolve();
	}
}
