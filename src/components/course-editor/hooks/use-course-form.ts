import { useForm, useStore as useFormStore } from "@tanstack/react-form";
import { toMerged } from "es-toolkit";
import { useEffect } from "react";
import type { PartialDeep } from "type-fest";
import { useStore } from "zustand";
import type { CourseFormApi } from "~/lib/contexts/course-editor";
import { Course } from "~/lib/models/course";
import { CourseStore } from "~/lib/stores/course-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import {
	resolveTimetableStyle,
	resolveTimetableStyleColorByIndex,
} from "~/lib/utils/timetable-styles";
import { validateMeetingTimeConflicts } from "./use-course-validation";

interface UseCourseFormProps {
	onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	defaultValues?: PartialDeep<Course.Schema>;
	onDirtyChange?: (isDirty: boolean) => void;
}

export function useCourseForm({
	onSubmit,
	defaultValues,
	onDirtyChange,
}: UseCourseFormProps) {
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(s) => s.activeStyleId,
	);
	const timetableColorMode = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableColorMode,
	);
	const courseCount = useStore(CourseStore, (s) => s.courses.length);
	const style = resolveTimetableStyle(activeStyleId);
	const defaultThemeColorIndex =
		courseCount % style.variants[timetableColorMode].gridColors.length;

	const form = useForm({
		validators: {
			onChange: ({ value }) => validateMeetingTimeConflicts(value),
			onSubmit: Course.schema,
		},
		defaultValues: toMerged(
			{
				code: "",
				name: "",
				themeColorIndex: defaultThemeColorIndex,
				meetingTimes: [
					{
						day: 1,
						location: "",
						startTime: "10:00",
						endTime: "12:00",
					},
				],
				cellAppearance: {
					background: resolveTimetableStyleColorByIndex(
						activeStyleId,
						defaultThemeColorIndex,
						timetableColorMode,
					),
					fgColor: "#ffffff",
					icon: {
						type: "emoji",
						emoji: "",
						svg: "",
						opacity: 0.7,
						rotation: 15,
						offsetX: 12,
						offsetY: 12,
						size: 3,
					},
				},
			} satisfies Course.Schema,
			defaultValues ?? {},
		) as Course.Schema,
		onSubmit: async ({ value }) => {
			onSubmit(value, form);
		},
	});

	const isDirty = useFormStore(form.store, (s) => s.isDirty);

	useEffect(() => {
		onDirtyChange?.(isDirty);
	}, [isDirty, onDirtyChange]);

	return { form, isDirty };
}
