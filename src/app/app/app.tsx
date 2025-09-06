"use client";

import { DownloadIcon, Settings, Settings2Icon } from "lucide-react";
import { domToPng } from "modern-screenshot";
import CourseManagementSheet from "~/components/course-management-sheet";
import { ThemeToggle } from "~/components/settings/theme-toggle";
import TimetableCustomizer from "~/components/settings/timetable-customizer";
import WeeklyTimetable from "~/components/timetable/weekly-timetable";
import { Button } from "~/components/ui/button";

// TODO: Export button instead or both and show save file picker?
const handleDownloadPng = async () => {
	const node = document.querySelector(
		"#weekly-timetable",
	) as HTMLElement | null;

	if (!node) {
		// TODO: Should error and alert the user here
		return;
	}

	const padding = 16;
	const borderRadius = 8;

	const dataUrl = await domToPng(node, {
		scale: 3,
		// Needs recalculation because we're adding padding
		width: node.scrollWidth + padding * 2,
		height: node.scrollHeight + padding * 2,
		style: {
			padding: `${padding}px`,
			borderRadius: `${borderRadius}px`,
		},
	});

	const link = document.createElement("a");
	link.download = "timetable.png";
	link.href = dataUrl;
	link.click();
};

function App() {
	return (
		<div className="flex flex-col flex-1 items-center justify-center">
			<div className="m-4 flex flex-wrap justify-center gap-2">
				<ThemeToggle />

				<CourseManagementSheet>
					<Button variant="outline">
						<Settings className="w-4 h-4" />
						Manage Courses
					</Button>
				</CourseManagementSheet>
				<TimetableCustomizer>
					<Button variant="outline">
						<Settings2Icon className="w-4 h-4" />
						Customize
					</Button>
				</TimetableCustomizer>
				<Button onClick={handleDownloadPng}>
					<DownloadIcon className="w-4 h-4" />
					Download as PNG
				</Button>
			</div>
			<WeeklyTimetable containerId="weekly-timetable" />
		</div>
	);
}

export default App;
