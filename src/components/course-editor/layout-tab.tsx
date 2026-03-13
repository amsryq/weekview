import { useCourseEditorForm } from "~/lib/contexts/course-editor";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { CellAppearanceLayoutSettings } from "../settings/cell-appearance-layout-settings";

export function LayoutTab() {
	const form = useCourseEditorForm();

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold">Layout</h3>
				<p className="text-sm text-muted-foreground">
					Configure how this course is displayed in the timetable
				</p>
			</div>

			<CellAppearanceLayoutSettings
				form={form}
				baseValues={TimetablePreferencesStore.getState().cellAppearance}
			/>
		</div>
	);
}
