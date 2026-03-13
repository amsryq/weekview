import { useStore as useFormStore } from "@tanstack/react-form";
import { PartialDeep } from "type-fest";
import { useCourseEditorForm } from "~/lib/contexts/course-editor";
import type { CellAppearance } from "~/lib/models/cell-appearance";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { CellAppearanceLayoutSettings } from "../settings/cell-appearance-layout-settings";

export function LayoutTab() {
	const form = useCourseEditorForm();
	const currentCellAppearance = useFormStore(
		form.store,
		(s: any) => s.values.cellAppearance,
	);

	const handleCellAppearanceChange = (values: PartialDeep<CellAppearance>) => {
		form.setFieldValue("cellAppearance", values as CellAppearance);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold">Layout</h3>
				<p className="text-sm text-muted-foreground">
					Configure how this course is displayed in the timetable
				</p>
			</div>

			<CellAppearanceLayoutSettings
				value={currentCellAppearance}
				baseValues={TimetablePreferencesStore.getState().cellAppearance}
				onChange={handleCellAppearanceChange}
			/>
		</div>
	);
}
