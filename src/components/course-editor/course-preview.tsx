import { useStore as useFormStore } from "@tanstack/react-form";
import { toMerged } from "es-toolkit";
import { useStore } from "zustand";
import { useCourseEditorForm } from "~/lib/contexts/course-editor";
import { Clock, TimeRange } from "~/lib/models/clock";
import { Course } from "~/lib/models/course";
import { MeetingTime } from "~/lib/models/meeting-time";
import { ManualCourseProvider } from "~/lib/providers/manual-course-provider";
import {
	type TimetablePreferences,
	TimetablePreferencesStore,
} from "~/lib/stores/timetable-preferences";
import { resolveTimetableStyleColorByIndex } from "~/lib/utils/timetable-styles";
import { CourseBlock } from "../timetable/course-block";

export function CoursePreview() {
	const form = useCourseEditorForm();
	const formData = useFormStore(form.store, (s) => s.values);
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(s: TimetablePreferences) => s.activeStyleId,
	);
	const timetableColorMode = useStore(
		TimetablePreferencesStore,
		(s: TimetablePreferences) => s.timetableColorMode,
	);

	const mockMeetingTime = new MeetingTime({
		day: 1,
		time: new TimeRange(Clock.fromString("09:00"), Clock.fromString("10:30")),
		location: formData.meetingTimes?.[0]?.location,
	});

	const mockCourse = new Course({
		code: formData.code || "CODE101",
		name: formData.name,
		meetingTimes: [mockMeetingTime],
		cellAppearance: formData.cellAppearance,
		provider: ManualCourseProvider.instance,
	});

	const appearance = toMerged(
		TimetablePreferencesStore.getState().cellAppearance,
		formData.cellAppearance,
	);

	const resolvedAppearance =
		formData.themeColorIndex !== null && formData.themeColorIndex !== undefined
			? toMerged(appearance, {
					background: resolveTimetableStyleColorByIndex(
						activeStyleId,
						formData.themeColorIndex,
						timetableColorMode,
					),
				})
			: appearance;

	return (
		<div className="flex flex-col items-center space-y-4 w-full">
			<div className="text-center">
				<h4 className="text-sm font-medium">Preview</h4>
				<p className="text-xs text-muted-foreground">
					See how your course will look in the timetable
				</p>
			</div>

			<div className="border rounded-xl w-full max-w-[280px] p-6 h-40 bg-background/50 shadow-sm overflow-hidden flex items-center justify-center">
				<div className="w-full h-full max-w-[200px] max-h-[120px] pointer-events-none selection:none">
					<CourseBlock
						course={mockCourse}
						meetingTime={mockMeetingTime}
						appearance={resolvedAppearance}
						layoutType="rows"
						className="relative overflow-hidden select-none cursor-default"
					/>
				</div>
			</div>
		</div>
	);
}
