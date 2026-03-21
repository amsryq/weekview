import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useImporterDialogs } from "~/lib/contexts/importer-dialogs";
import { CourseProvider } from "../models/course-provider";

let singletonCache: ManualCourseProvider | null = null;

export class ManualCourseProvider extends CourseProvider {
	constructor() {
		super({
			name: "My Courses",
			emptyStateText:
				"No courses added yet. Add courses by clicking the button below.",
		});
	}

	static get instance(): ManualCourseProvider {
		return (singletonCache ??= new ManualCourseProvider());
	}

	public async sync(): Promise<void> {
		// Manual sources don't sync - they're user-managed
		return Promise.resolve();
	}
}

export function ManualAddCourseButton({ className }: { className?: string }) {
	const { openManualImporter } = useImporterDialogs();
	return (
		<Button className={className} onClick={openManualImporter}>
			<PlusIcon className="w-4 h-4" />
			Add Course
		</Button>
	);
}
