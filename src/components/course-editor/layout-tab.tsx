import { toMerged } from "es-toolkit";
import { useFormContext } from "react-hook-form";
import { PartialDeep } from "type-fest";
import type { CellAppearance } from "~/lib/models/cell-appearance";
import type { Course } from "~/lib/models/course";
import { CellAppearanceLayoutSettings } from "../cell-appearance-layout-settings";

export function LayoutTab() {
	const form = useFormContext<Course.Schema>();

	const currentCellAppearance = form.watch("cellAppearance");
	const handleCellAppearanceChange = (changes: PartialDeep<CellAppearance>) => {
		form.setValue(
			"cellAppearance",
			toMerged(form.getValues("cellAppearance"), changes),
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		);
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
				onChange={handleCellAppearanceChange}
			/>
		</div>
	);
}
