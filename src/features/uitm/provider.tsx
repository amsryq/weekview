import { ImportIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CourseProvider } from "~/lib/models/course-provider";
import { useImporterDialogs } from "~/lib/contexts/importer-dialogs";
import { UiTMCourseSection } from "./course-section";
import clsx from "clsx";

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

	public useCourses(): UiTMCourseSection[] {
		return super.useCourses() as UiTMCourseSection[];
	}

	public sync(): Promise<void> {
		return Promise.resolve();
	}
}

export function UiTMAddCourseButton({ className }: { className?: string }) {
	const { openUiTMImporter } = useImporterDialogs();
	return (
		<Button className={clsx("bg-[#753895] text-white hover:bg-[#5a2c7a]", className)} onClick={openUiTMImporter}>
			<img className="w-6 h-6" src="/images/uitm-logo.png" />
			Import from UiTM
		</Button>
	);
}
