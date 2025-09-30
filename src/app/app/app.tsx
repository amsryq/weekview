"use client";

import { DownloadIcon, HeartIcon, Settings, Settings2Icon } from "lucide-react";
import { domToPng } from "modern-screenshot";
import CourseManagementSheet from "~/components/course-management-sheet";
import TimetableCustomizer from "~/components/settings/timetable-customizer";
import WeeklyTimetable from "~/components/timetable/weekly-timetable";
import { Button } from "~/components/ui/button";
import { useSupportDialog } from "~/lib/contexts/support-dialog";

// TODO: Export button instead or both and show save file picker?
const handleDownloadPng = async () => {
	const node = document.querySelector(
		"#weekly-timetable",
	) as HTMLElement | null;

	if (!node) {
		// TODO: Should error and alert the user here
		return;
	}

	const borderRadius = 8;

	const dataUrl = await domToPng(node, {
		scale: 3,
		style: {
			borderRadius: `${borderRadius}px`,
		},
	});

	const link = document.createElement("a");
	link.download = "timetable.png";
	link.href = dataUrl;
	link.click();
};

function App() {
	const { openSupportDialog } = useSupportDialog();

	return (
		<div className="flex flex-col flex-1 items-center justify-center">
			<div className="m-4 flex flex-wrap justify-center gap-2">
				<CourseManagementSheet>
					<Button variant="outline">
						<Settings className="w-4 h-4" />
						Manage Courses
					</Button>
				</CourseManagementSheet>
				<TimetableCustomizer>
					<Button variant="outline">
						<Settings2Icon className="w-4 h-4" />
						Customize Timetable
					</Button>
				</TimetableCustomizer>
				<Button onClick={handleDownloadPng}>
					<DownloadIcon className="w-4 h-4" />
					Download as PNG
				</Button>
				<Button
					onClick={() =>
						openSupportDialog({
							title: "Support me!",
							description:
								"Thanks for checking out this project! Even though it started as a hobby, I've spent a lot of time (and some money) building it. Any support you give means a lot!",
							showAlternatives: true,
						})
					}
					variant="outline"
				>
					<HeartIcon className="w-4 h-4" />
					Support
				</Button>
			</div>
			<WeeklyTimetable containerId="weekly-timetable" />
		</div>
	);
}

export default App;
