import { SettingsIcon } from "lucide-react";
import { JSX } from "react";
import { Button } from "~/components/ui/button";
import { CourseProvider } from "~/lib/models/course-provider";
import TechnoUniversityImporterDialog from "./components/importer-dialog";
import { TechnoGroup } from "./techno-group";

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

	public useCourses(): TechnoGroup[] {
		return super.useCourses() as TechnoGroup[];
	}

	public sync(): Promise<void> {
		return Promise.resolve();
	}

	public renderAddCourseButton(): JSX.Element {
		return (
			<TechnoUniversityImporterDialog>
				<Button className="w-full">
					<SettingsIcon className="w-4 h-4" />
					Manage
				</Button>
			</TechnoUniversityImporterDialog>
		);
	}
}
