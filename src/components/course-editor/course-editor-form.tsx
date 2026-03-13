import { useForm, useStore as useFormStore } from "@tanstack/react-form";
import { useBlocker } from "@tanstack/react-router";
import { toMerged } from "es-toolkit";
import { BookOpen, Eye, Palette, Smile } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AppearanceTab } from "./appearance-tab";
import { CourseDetailsTab } from "./course-details-tab";
import { CoursePreview } from "./course-preview";
import { LayoutTab } from "./layout-tab";

interface CourseEditorFormProps {
	onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	defaultValues?: PartialDeep<Course.Schema>;
	onDirtyChange?: (isDirty: boolean) => void;
}

type TabValue = "basics" | "style" | "icon";

export function CourseEditorForm({
	onSubmit,
	defaultValues,
	onDirtyChange,
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

	const [activeTab, setActiveTab] = useState<TabValue>("basics");

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

	const isDirty = useFormStore(form.store, (s) => s.isDirty);

	useEffect(() => {
		onDirtyChange?.(isDirty);
	}, [isDirty, onDirtyChange]);

	useBlocker({
		shouldBlockFn: () => {
			if (!isDirty) return false;
			return !window.confirm(
				"You have unsaved changes in the editor. Are you sure you want to leave?",
			);
		},
		enableBeforeUnload: () => isDirty,
	});

	return (
		<CourseEditorFormContext.Provider value={form}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex flex-col h-full min-h-0"
			>
				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as TabValue)}
					className="flex-1 flex flex-col min-h-0 gap-0"
				>
					<div className="px-4 sm:px-6 pt-2 pb-4">
						<TabsList className="w-full max-w-2xl mx-auto grid grid-cols-3">
							<TabsTrigger value="basics" className="gap-2">
								<BookOpen className="size-4" />
								<span className="hidden sm:inline">Basics</span>
							</TabsTrigger>
							<TabsTrigger value="style" className="gap-2">
								<Palette className="size-4" />
								<span className="hidden sm:inline">Style</span>
							</TabsTrigger>
							<TabsTrigger value="icon" className="gap-2">
								<Smile className="size-4" />
								<span className="hidden sm:inline">Icon</span>
							</TabsTrigger>
						</TabsList>
					</div>

					<div className="flex-1 flex min-h-0 overflow-hidden">
						<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
							<div className="max-w-2xl mx-auto">
								<TabsContent value="basics" className="mt-0">
									<CourseDetailsTab />
								</TabsContent>
								<TabsContent value="style" className="mt-0 space-y-6">
									<AppearanceTab showIcon={false} />
									<LayoutTab />
								</TabsContent>
								<TabsContent value="icon" className="mt-0">
									<AppearanceTab showOnlyIcon={true} />
								</TabsContent>
							</div>
						</div>

						{/* Preview Sidebar - Only visible on desktop if it fits */}
						<aside className="hidden xl:flex w-80 border-l bg-muted/5 p-6 flex-col items-center shrink-0">
							<div className="sticky top-0 w-full">
								<CoursePreview />
							</div>
						</aside>
					</div>
				</Tabs>

				{/* Footer Actions */}
				<footer className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-4 pb-4 border-t shrink-0">
					<div className="xl:hidden">
						<Dialog>
							<DialogTrigger asChild>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="gap-2"
								>
									<Eye className="size-4" />
									Preview
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-md">
								<DialogHeader>
									<DialogTitle>Course Preview</DialogTitle>
								</DialogHeader>
								<div className="py-4">
									<CoursePreview />
								</div>
							</DialogContent>
						</Dialog>
					</div>

					<div className="flex gap-2 ml-auto">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => form.reset()}
						>
							Reset
						</Button>
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								size="sm"
							>
								Cancel
							</Button>
						</DialogClose>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={!canSubmit || (isSubmitting as boolean)}
									size="sm"
								>
									Save Course
								</Button>
							)}
						</form.Subscribe>
					</div>
				</footer>
			</form>
		</CourseEditorFormContext.Provider>
	);
}
