import { BookOpen, Eye, Info, Palette, Smile } from "lucide-react";
import { useState } from "react";
import type { PartialDeep } from "type-fest";
import {
	CourseEditorFormContext,
	type CourseFormApi,
} from "~/lib/contexts/course-editor";
import { Course } from "~/lib/models/course";
import { TimetableCustomizer } from "../settings/timetable-customizer";
import { Alert, AlertDescription } from "../ui/alert";
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
import { useCourseEditorNavigation } from "./hooks/use-course-editor-navigation";
import { useCourseForm } from "./hooks/use-course-form";
import { useCourseValidation } from "./hooks/use-course-validation";
import { LayoutTab } from "./layout-tab";

type TabValue = "basics" | "style" | "icon";

interface CourseEditorFormProps {
	onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	defaultValues?: PartialDeep<Course.Schema>;
	onDirtyChange?: (isDirty: boolean) => void;
}

export function CourseEditorForm({
	onSubmit,
	defaultValues,
	onDirtyChange,
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
					onValueChange={(v) => setActiveTab(v as TabValue)}
					className="flex-1 flex min-h-0"
					mobileClassName="flex-col gap-0"
				>
					<form.Subscribe
						selector={(state) => [state.fieldMeta, state.errorMap] as const}
					>
						{/* @ts-expect-error - it should infer but it doesn't idk why */}
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
							selector={(state) =>
								[state.canSubmit, state.isSubmitting] as const
							}
						>
							{/* @ts-expect-error - it should infer but it doesn't idk why */}
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
