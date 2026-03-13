import { Monitor, Moon, Sun } from "lucide-react";
import { useStore } from "zustand";
import { useTheme } from "~/lib/contexts/themes";
import { ColorEntry } from "~/lib/models/color-entry";
import { TIMETABLE_STYLES } from "~/lib/models/style";
import { CourseStore } from "~/lib/stores/course-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils/styles";

export function StyleSelector() {
	const { applyingTheme } = useTheme();
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(s) => s.activeStyleId,
	);
	const timetableThemePreference = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableThemePreference,
	);
	const timetableColorMode = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableColorMode,
	);

	const applyStyle = (styleId: string) => {
		TimetablePreferencesStore.getState().applyStyle(styleId);
		CourseStore.getState().resetAllToStyle(styleId);
	};

	const setThemePreference = (
		preference: "follow-app" | "light" | "dark",
	) => {
		const store = TimetablePreferencesStore.getState();
		store.setTimetableThemePreference(preference);
		if (preference === "follow-app") {
			store.setAppThemeMode(applyingTheme);
		}
		CourseStore.getState().resetAllToStyle(store.activeStyleId);
	};

	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-sm font-medium mb-2">Styles</h4>
				<p className="text-xs text-muted-foreground mb-4">
					Styles control timetable colors, background, and fonts.
				</p>
			</div>

			<div className="flex items-center gap-2 justify-between">
				<span className="text-sm font-semibold text-foreground mr-2">Timetable theme</span>
				<div className="flex items-center gap-3">
					<div className="inline-flex rounded-md bg-muted p-1 border border-muted-foreground/10">
						<button
							type="button"
							aria-label="Follow app theme"
							className={cn(
								"px-2 py-1 rounded-md transition-colors",
								timetableThemePreference === "follow-app"
									? "bg-primary/90 text-primary-foreground shadow"
									: "hover:bg-muted-foreground/10 text-muted-foreground"
							)}
							onClick={() => setThemePreference("follow-app")}
						>
							<Monitor className="size-4" />
						</button>
						<button
							type="button"
							aria-label="Light mode"
							className={cn(
								"px-2 py-1 rounded-md transition-colors",
								timetableThemePreference === "light"
									? "bg-primary/90 text-primary-foreground shadow"
									: "hover:bg-muted-foreground/10 text-muted-foreground"
							)}
							onClick={() => setThemePreference("light")}
						>
							<Sun className="size-4" />
						</button>
						<button
							type="button"
							aria-label="Dark mode"
							className={cn(
								"px-2 py-1 rounded-md transition-colors",
								timetableThemePreference === "dark"
									? "bg-primary/90 text-primary-foreground shadow"
									: "hover:bg-muted-foreground/10 text-muted-foreground"
							)}
							onClick={() => setThemePreference("dark")}
						>
							<Moon className="size-4" />
						</button>
					</div>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{TIMETABLE_STYLES.map((style) => {
					const isActive = style.id === activeStyleId;
					const previewColors = style.variants[timetableColorMode].gridColors.slice(
						0,
						6,
					);

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
									<span className="text-xs font-medium text-primary">
										Active
									</span>
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
				Switching style resets per-course color/font overrides to the selected
				style.
			</p>
		</div>
	);
}
