import { useForm } from "@tanstack/react-form";
import { toMerged } from "es-toolkit";
import type { PartialDeep } from "type-fest";
import { useStore } from "zustand";
import {
	CourseEditorFormContext,
	type CourseFormApi,
} from "~/lib/contexts/course-editor";
import { Course } from "~/lib/models/course";
import { MeetingTime } from "~/lib/models/meeting-time";
import { CourseStore } from "~/lib/stores/course-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import {
	resolveTimetableStyle,
	resolveTimetableStyleColorByIndex,
} from "~/lib/utils/timetable-styles";
import { Button } from "../ui/button";
import { DialogClose } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AppearanceTab } from "./appearance-tab";
import { CourseDetailsTab } from "./course-details-tab";
import { CoursePreview } from "./course-preview";
import { LayoutTab } from "./layout-tab";

interface CourseEditorFormProps {
	onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	defaultValues?: PartialDeep<Course.Schema>;
}

export function CourseEditorForm({
	onSubmit,
	defaultValues,
}: CourseEditorFormProps) {
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
		onSubmit: async ({ value, formApi }) => {
			const meetingObjs = value.meetingTimes.map((mt) =>
				MeetingTime.createFromSchema(mt),
			);

			// Check clashes between its own meetings
			for (let i = 0; i < meetingObjs.length; i++) {
				for (let j = i + 1; j < meetingObjs.length; j++) {
					if (meetingObjs[i].overlaps(meetingObjs[j])) {
						formApi.setFieldMeta(`meetingTimes[${i}]`, (prev) => ({
							...prev,
							errorMap: {
								onSubmit: `This meeting time conflicts with meeting #${j + 1}.`,
							},
						}));
						return;
					}
				}
			}

			onSubmit(value, form);
		},
	});

	return (
		<CourseEditorFormContext.Provider value={form}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex flex-col h-full min-h-0 shrink"
			>
				<div className="flex-1 min-h-0 max-lg:overflow-y-scroll max-lg:pr-4 max-lg:pl-2 max-lg:-ml-2">
					<div className="flex flex-col-reverse min-h-0 h-full lg:flex-row gap-6">
						<Tabs className="w-full min-h-0" defaultValue="details">
							<TabsList>
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="appearance">Appearance</TabsTrigger>
								<TabsTrigger value="layout">Layout</TabsTrigger>
								{/*<TabsTrigger value="icons">Icons</TabsTrigger>*/}
							</TabsList>

							<div className="pt-2 pb-4 lg:overflow-y-scroll lg:pr-4 lg:pl-2 lg:-ml-2">
								<TabsContent value="details" className="m-0">
									<CourseDetailsTab />
								</TabsContent>

								<TabsContent value="appearance" className="m-0">
									<AppearanceTab />
								</TabsContent>

								<TabsContent value="layout" className="m-0">
									<LayoutTab />
								</TabsContent>

								{/*<TabsContent value="icons" className="m-0">
									<IconsTab />
								</TabsContent>*/}
							</div>
						</Tabs>

						{/* Preview Sidebar */}
						<div className="w-full lg:w-80 lg:border-l lg:pl-6 max-lg:border-b max-lg:pb-6">
							<CoursePreview />
						</div>
					</div>
				</div>

				{/* Form Actions */}
				<div className="flex flex-1 flex-col-reverse grow-0 sm:flex-row justify-end gap-3 pt-6 border-t">
					<div className="flex gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => form.reset()}
							className="flex-1 sm:flex-none"
						>
							Reset
						</Button>
						<DialogClose asChild>
							<Button
								type="button"
								variant="secondary"
								className="flex-1 sm:flex-none"
							>
								Cancel
							</Button>
						</DialogClose>
					</div>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								type="submit"
								disabled={!canSubmit || (isSubmitting as boolean)}
								className="flex-1 sm:flex-none"
							>
								Save Course
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</CourseEditorFormContext.Provider>
	);
}
