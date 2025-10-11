import { ImportIcon } from "lucide-react";
import { JSX } from "react";
import { Button } from "~/components/ui/button";
import { CourseProvider } from "~/lib/models/course-provider";
import UiTMImporterDialog from "./components/importer-dialog";
import { UiTMGroup } from "./group";

let singletonCache: UiTMProvider | null = null;

export class UiTMProvider extends CourseProvider {
	constructor() {
		super({
			name: `UiTM`,
			emptyStateText:
				"No courses/groups imported yet. Click the button below to import.",
		});
	}

	public static get instance(): UiTMProvider {
		return (singletonCache ??= new UiTMProvider());
	}

	public useCourses(): UiTMGroup[] {
		return super.useCourses() as UiTMGroup[];
	}

	public sync(): Promise<void> {
		return Promise.resolve();
	}

	public renderAddCourseButton(): JSX.Element {
		return (
			<UiTMImporterDialog>
				<Button className="w-full">
					<ImportIcon className="w-4 h-4" />
					Import from UiTM
				</Button>
			</UiTMImporterDialog>
		);
	}
}
