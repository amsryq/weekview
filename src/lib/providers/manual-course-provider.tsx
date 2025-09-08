import { PlusIcon } from "lucide-react";
import { JSX } from "react";
import CourseEditorDialog from "~/components/course-editor/course-editor-dialog";
import { Button } from "~/components/ui/button";
import { Course } from "../models/course";
import { CourseProvider } from "../models/course-provider";
import { CourseStore } from "../stores/course-store";

let singletonCache: ManualCourseProvider | null = null;

export class ManualCourseProvider extends CourseProvider {
	constructor() {
		super({ name: "My Courses" });
	}

	static get instance(): ManualCourseProvider {
		return (singletonCache ??= new ManualCourseProvider());
	}

	public async sync(): Promise<void> {
		// Manual sources don't sync - they're user-managed
		return Promise.resolve();
	}

	public renderAddCourseButton(): JSX.Element {
		return (
			<CourseEditorDialog
				title="Add Course"
				onSubmit={(data, form) => {
					const course = Course.createFromSchema(data);
					const conflicts = CourseStore.getState().getConflictingCourses(
						course.meetingTimes,
					);
					if (conflicts.length > 0) {
						form.setError("meetingTimes", {
							message: `There are time conflicts with ${conflicts.map((c) => c.code).join(", ")}.`,
						});
						return;
					}

					CourseStore.getState().addCourse(course);
				}}
			>
				<Button>
					<PlusIcon className="w-4 h-4" />
					Add Course
				</Button>
			</CourseEditorDialog>
		);
	}
}
