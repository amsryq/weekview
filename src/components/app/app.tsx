import { Settings, Settings2Icon } from "lucide-react";
import { CourseManagementSheet } from "~/components/course-management-sheet";
import { TimetableCustomizer } from "~/components/settings/timetable-customizer";
import { TimetableExportMenu } from "~/components/timetable/export-menu";
import { WeeklyTimetable } from "~/components/timetable/weekly-timetable";
import { Button } from "~/components/ui/button";

function App() {
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
				<TimetableExportMenu />
			</div>
			<WeeklyTimetable containerId="weekly-timetable" />
		</div>
	);
}

export default App;
