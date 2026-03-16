import { Settings, Settings2Icon } from "lucide-react";
import { useEffect } from "react";
import { TimetableCustomizer } from "~/components/settings/timetable-customizer";
import { TimetableExportMenu } from "~/components/timetable/export-menu";
import { WeeklyTimetable } from "~/components/timetable/weekly-timetable";
import { Button } from "~/components/ui/button";
import { useCourseManagementSheet } from "~/lib/contexts/course-management-sheet";
import { useTheme } from "~/lib/contexts/themes";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { ManageCoursesTooltip } from "./manage-courses-tooltip";

function App() {
	const { applyingTheme } = useTheme();
	const { openSheet } = useCourseManagementSheet();

	useEffect(() => {
		TimetablePreferencesStore.getState().setAppThemeMode(applyingTheme);
	}, [applyingTheme]);

	return (
		<div className="flex flex-col flex-1 items-center justify-center">
			<div className="m-4 flex flex-wrap justify-center gap-2">
				<ManageCoursesTooltip>
					<Button variant="outline" onClick={openSheet}>
						<Settings className="w-4 h-4" />
						Manage Courses
					</Button>
				</ManageCoursesTooltip>
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
