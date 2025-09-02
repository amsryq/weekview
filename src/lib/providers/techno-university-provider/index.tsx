import { ImportIcon } from "lucide-react";
import { JSX } from "react";
import { Button } from "~/components/ui/button";
import { CourseProvider } from "~/lib/models/course-provider";
import { TimeRange } from "~/lib/models/time-range";
import TechnoUniversityImporterDialog from "./importer-dialog";

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

	public renderAddCourseButton(): JSX.Element {
		return (
			<TechnoUniversityImporterDialog>
				<Button className="w-full">
					<ImportIcon className="w-4 h-4" />
					Import from Techno University
				</Button>
			</TechnoUniversityImporterDialog>
		);
	}
}
