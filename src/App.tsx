import {
	DownloadIcon,
	ImportIcon,
	Settings,
	SlidersHorizontal,
	UserIcon,
} from "lucide-react";
import { domToPng } from "modern-screenshot";
import { AccountManagerDialog } from "./components/account-manager-dialog";
import CourseManagementSheet from "./components/course-management-sheet";
import { ThemeToggle } from "./components/theme-toggle";
import TimetableCustomizer from "./components/timetable-customizer";
import { Button } from "./components/ui/button";
import WeeklyTimetable from "./components/weekly-timetable";
import TechnoUniversityImporterDialog from "./lib/providers/techno-university-provider/importer-dialog";

function App() {
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

	return (
		<div className="flex flex-col items-center justify-center container h-screen mx-auto p-4 w-full">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>

			<AccountManagerDialog>
				<Button variant="outline">
					<UserIcon className="w-4 h-4" />
					Manage Account
				</Button>
			</AccountManagerDialog>
			<div className="m-4 flex flex-wrap justify-center gap-2">
				<CourseManagementSheet>
					<Button variant="outline">
						<Settings className="w-4 h-4" />
						Manage Courses
					</Button>
				</CourseManagementSheet>
				<TechnoUniversityImporterDialog>
					<Button variant="outline">
						<ImportIcon className="w-4 h-4" />
						Import from Techno University
					</Button>
				</TechnoUniversityImporterDialog>
				<TimetableCustomizer>
					<Button variant="outline">
						<SlidersHorizontal className="w-4 h-4" />
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
