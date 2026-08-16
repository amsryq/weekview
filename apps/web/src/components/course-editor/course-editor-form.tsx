import { BookOpen, Eye, Info, Palette, Smile, Trash2Icon } from "lucide-react";
import { useState } from "react";
import type { PartialDeep } from "type-fest";
import {
	CourseEditorFormContext,
	type CourseFormApi,
} from "~/lib/contexts/course-editor";
import { Course } from "~/lib/models/course";
import { TimetableCustomizer } from "../settings/timetable-customizer";
import { Alert, AlertDescription } from "../ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { ResponsiveDialogClose } from "../ui/responsive-dialog";
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
import { useCourseEditorNavigation } from "./hooks/use-course-editor-navigation";
import { useCourseForm } from "./hooks/use-course-form";
import { useCourseValidation } from "./hooks/use-course-validation";
import { LayoutTab } from "./layout-tab";

type TabValue = "basics" | "style" | "icon";

function isTabValue(cause: unknown): cause is TabValue {
	return cause === "basics" || cause === "style" || cause === "icon";
}

interface CourseEditorFormProps {
	onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	defaultValues?: PartialDeep<Course.Schema>;
	onDirtyChange?: (isDirty: boolean) => void;
	onDelete?: () => void;
}

export function CourseEditorForm({
	onSubmit,
	defaultValues,
	onDirtyChange,
	onDelete,
}: CourseEditorFormProps) {
	const [activeTab, setActiveTab] = useState<TabValue>("basics");

	const { form, isDirty } = useCourseForm({
		onSubmit,
		defaultValues,
		onDirtyChange,
	});

	const { validateForm, getTabErrors } = useCourseValidation(form);

	useCourseEditorNavigation({
		isDirty,
		isSubmitSuccessful: form.state.isSubmitSuccessful,
	});

	return (
		<CourseEditorFormContext.Provider value={form}>
			<form onSubmit={validateForm} className="flex flex-col h-full min-h-0">
				<ResponsiveTabs
					value={activeTab}
					onValueChange={(v) => {
						if (isTabValue(v)) setActiveTab(v);
					}}
					className="flex-1 flex min-h-0"
					mobileClassName="flex-col gap-0"
				>
					<form.Subscribe
						selector={(state) => [state.fieldMeta, state.errorMap] as const}
					>
						{([fieldMeta, errorMap]) => {
							const { basicsHasErrors, styleHasErrors, iconHasErrors } =
								getTabErrors(fieldMeta, errorMap);

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
						<div className="flex-1 flex flex-col min-h-0 min-w-0 sm:overflow-y-auto">
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
									<Alert>
										<Info className="size-4 shrink-0" />
										<AlertDescription className="inline text-xs">
											Manage these settings in{" "}
											<TimetableCustomizer initialTab="cells">
												<button
													type="button"
													className="font-medium underline underline-offset-2 hover:text-foreground transition-colors text-foreground"
												>
													global preferences
												</button>
											</TimetableCustomizer>{" "}
											for a consistent look.
										</AlertDescription>
									</Alert>
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
				<footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-4 py-4 sm:px-6">
					<div className="flex min-w-0 items-center gap-2">
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
						{onDelete && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
									>
										<Trash2Icon className="size-4" />
										Delete
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Remove {defaultValues?.code ?? "this course"}?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This action will remove the course and its meetings from
											your timetable.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={onDelete}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>

					<div className="ml-auto flex flex-wrap items-center justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => form.reset()}
						>
							Reset
						</Button>
						<ResponsiveDialogClose asChild>
							<Button type="button" variant="outline" size="sm">
								Cancel
							</Button>
						</ResponsiveDialogClose>
						<form.Subscribe
							selector={(state) =>
								[state.canSubmit, state.isSubmitting] as const
							}
						>
							{([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={!canSubmit || isSubmitting}
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
