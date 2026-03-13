import { toMerged } from "es-toolkit";
import { useFormContext } from "react-hook-form";
import { useStore } from "zustand";
import { Clock, TimeRange } from "~/lib/models/clock";
import { Course } from "~/lib/models/course";
import { MeetingTime } from "~/lib/models/meeting-time";
import { getStyleColorByIndex } from "~/lib/models/style";
import { ManualCourseProvider } from "~/lib/providers/manual-course-provider";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { CourseBlock } from "../timetable/course-block";

export function CoursePreview() {
	const form = useFormContext<Course.Schema>();
	const formData = form.watch();
	const activeStyleId = useStore(TimetablePreferencesStore, (s) => s.activeStyleId);
	const timetableColorMode = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableColorMode,
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
					background: getStyleColorByIndex(
						activeStyleId,
						formData.themeColorIndex,
						timetableColorMode,
					),
				})
			: appearance;

	return (
		<div className="flex flex-col items-center space-y-4">
			<div className="text-center">
				<h4 className="text-sm font-medium">Preview</h4>
				<p className="text-xs text-muted-foreground">
					See how your course will look in the timetable
				</p>
			</div>

			<div className="border rounded-lg w-64 p-4 h-32">
				<CourseBlock
					course={mockCourse}
					meetingTime={mockMeetingTime}
					appearance={resolvedAppearance}
					layoutType="rows"
				/>
			</div>
		</div>
	);
}
