import { useStore } from "zustand";
import { ColorEntry } from "~/lib/models/color-entry";
import { TIMETABLE_STYLES } from "~/lib/models/style";
import { CourseStore } from "~/lib/stores/course-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { cn } from "~/lib/utils/styles";

export function StyleSelector() {
	const activeStyleId = useStore(TimetablePreferencesStore, (s) => s.activeStyleId);

	const applyStyle = (styleId: string) => {
		TimetablePreferencesStore.getState().applyStyle(styleId);
		CourseStore.getState().resetAllToStyle(styleId);
	};

	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-sm font-medium mb-2">Styles</h4>
				<p className="text-xs text-muted-foreground mb-4">
					Styles control timetable colors, background, and fonts.
				</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{TIMETABLE_STYLES.map((style) => {
					const isActive = style.id === activeStyleId;
					const previewColors = style.gridColors.slice(0, 6);

					return (
						<button
							key={style.id}
							type="button"
							onClick={() => applyStyle(style.id)}
							className={cn(
								"rounded-lg border p-3 text-left transition-all",
								isActive
									? "border-primary bg-primary/5"
									: "hover:border-muted-foreground/30",
							)}
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-semibold">{style.name}</p>
									<p
										className="text-xs text-muted-foreground"
										style={{ fontFamily: `'${style.fontFamily}', sans-serif` }}
									>
										{style.fontFamily}
									</p>
								</div>
								{isActive && (
									<span className="text-xs font-medium text-primary">Active</span>
								)}
							</div>

							<div className="mt-3 flex gap-1">
								{previewColors.map((color, index) => (
									<div
										key={`${style.id}-${index}`}
										className="h-5 w-5 rounded"
										style={ColorEntry.getBackgroundStyle(color)}
									/>
								))}
							</div>
						</button>
					);
				})}
			</div>

			<p className="text-xs text-muted-foreground">
				Switching style resets per-course color/font overrides to the selected style.
			</p>
		</div>
	);
}
