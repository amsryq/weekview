import { useForm, useStore as useFormStore } from "@tanstack/react-form";
import { useBlocker } from "@tanstack/react-router";
import { toMerged } from "es-toolkit";
import { BookOpen, Eye, Palette, Smile } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { TimetableCustomizer } from "../settings/timetable-customizer";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	ResponsiveTabs,
	ResponsiveTabsContent,
	ResponsiveTabsList,
	ResponsiveTabsTrigger,
} from "../ui/responsive-tabs";
import { Separator } from "../ui/separator";
import { AppearanceTab, IconSection } from "./appearance-tab";
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

	const hasErrorMapErrors = (errorMap: Record<string, unknown> | undefined) =>
		Object.values(errorMap ?? {}).some((error) => {
			if (Array.isArray(error)) return error.length > 0;
			return error !== undefined && error !== null && error !== "";
		});

	const hasFieldErrors = (
		fieldMeta: Record<string, { errors?: unknown[] } | undefined>,
		predicate?: (name: string) => boolean,
	) =>
		Object.entries(fieldMeta ?? {}).some(
			([name, meta]) =>
				(!predicate || predicate(name)) && (meta?.errors?.length ?? 0) > 0,
		);

	return (
		<CourseEditorFormContext.Provider value={form}>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					e.stopPropagation();
					await form.handleSubmit();

					if (
						hasFieldErrors(form.state.fieldMeta) ||
						hasErrorMapErrors(form.state.errorMap)
					) {
						toast.error("Could not save course", {
							description: "Please fix the errors in the form and try again.",
						});
					}
				}}
				className="flex flex-col h-full min-h-0"
			>
				<ResponsiveTabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as TabValue)}
					className="flex-1 flex min-h-0"
					mobileClassName="flex-col gap-0"
				>
					<form.Subscribe
						selector={(state) => [state.fieldMeta, state.errorMap]}
					>
						{([fieldMeta, errorMap]) => {
							const meta = (fieldMeta ?? {}) as Record<
								string,
								{ errors?: unknown[] } | undefined
							>;

							const basicsHasErrors =
								hasErrorMapErrors(
									errorMap as Record<string, unknown> | undefined,
								) ||
								hasFieldErrors(
									meta,
									(name) =>
										name.startsWith("code") ||
										name.startsWith("name") ||
										name.startsWith("meetingTimes"),
								);
							const styleHasErrors = hasFieldErrors(
								meta,
								(name) =>
									name.startsWith("cellAppearance") &&
									!name.startsWith("cellAppearance.icon"),
							);
							const iconHasErrors = hasFieldErrors(meta, (name) =>
								name.startsWith("cellAppearance.icon"),
							);

							return (
								<ResponsiveTabsList
									mobileWrapperClassName="px-4 pt-2 pb-4 shrink-0"
									mobileClassName="w-full max-w-2xl mx-auto grid grid-cols-3"
								>
									<ResponsiveTabsTrigger value="basics" className="gap-2">
										<BookOpen className="size-4" />
										<span>Basics</span>
										{basicsHasErrors && (
											<span className="bg-destructive rounded-full size-1.5 sm:ml-auto" />
										)}
									</ResponsiveTabsTrigger>
									<ResponsiveTabsTrigger value="style" className="gap-2">
										<Palette className="size-4" />
										<span>Look</span>
										{styleHasErrors && (
											<span className="bg-destructive rounded-full size-1.5 sm:ml-auto" />
										)}
									</ResponsiveTabsTrigger>
									<ResponsiveTabsTrigger value="icon" className="gap-2">
										<Smile className="size-4" />
										<span>Icon</span>
										{iconHasErrors && (
											<span className="bg-destructive rounded-full size-1.5 sm:ml-auto" />
										)}
									</ResponsiveTabsTrigger>
								</ResponsiveTabsList>
							);
						}}
					</form.Subscribe>

					<div className="flex-1 flex min-h-0 sm:overflow-hidden">
						<div className="flex-1 flex flex-col min-h-0 sm:overflow-y-auto">
							<ResponsiveTabsContent
								value="basics"
								className="mt-0 max-w-2xl mx-auto w-full"
								mobileWrapperClassName="flex-1 overflow-y-auto px-4 py-4 min-h-0"
							>
								<CourseDetailsTab />
							</ResponsiveTabsContent>

							<ResponsiveTabsContent
								value="style"
								className="mt-0 space-y-6 max-w-2xl mx-auto w-full"
								mobileWrapperClassName="flex-1 overflow-y-auto px-4 py-4 min-h-0"
							>
								<div>
									<h3 className="text-sm font-medium mb-4">Appearance</h3>
									<AppearanceTab />
								</div>
								<div className="space-y-3">
									<Separator />
									<h3 className="text-sm font-medium">Layout</h3>
									<p className="text-xs text-muted-foreground">
										These settings are better configured globally.{" "}
										<TimetableCustomizer initialTab="cells">
											<button
												type="button"
												className="underline underline-offset-2 hover:text-foreground transition-colors"
											>
												Open global settings
											</button>
										</TimetableCustomizer>
									</p>
									<LayoutTab />
								</div>
							</ResponsiveTabsContent>

							<ResponsiveTabsContent
								value="icon"
								className="mt-0 max-w-2xl mx-auto w-full"
								mobileWrapperClassName="flex-1 overflow-y-auto px-4 py-4 min-h-0"
							>
								<IconSection />
							</ResponsiveTabsContent>
						</div>

						{/* Preview Sidebar - Only visible on desktop if it fits */}
						<aside className="hidden xl:flex w-80 border-l bg-muted/5 p-6 flex-col items-center shrink-0">
							<div className="sticky top-0 w-full">
								<CoursePreview />
							</div>
						</aside>
					</div>
				</ResponsiveTabs>

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
							<Button type="button" variant="outline" size="sm">
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
