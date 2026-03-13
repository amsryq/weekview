import { useCourseEditorForm } from "~/lib/contexts/course-editor";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { CellAppearanceLayoutSettings } from "../settings/cell-appearance-layout-settings";

export function LayoutTab() {
	const form = useCourseEditorForm();

	return (
		<CellAppearanceLayoutSettings
			form={form}
			baseValues={TimetablePreferencesStore.getState().cellAppearance}
		/>
	);
}
