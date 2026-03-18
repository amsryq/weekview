import { ClockIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useStore } from "zustand";
import { UiTMAddCourseButton, UiTMProvider } from "~/features/uitm/provider";
import { useCourseManagementSheet } from "~/lib/contexts/course-management-sheet";
import { useProviderCourses } from "~/lib/hooks/use-courses";
import { ColorEntry } from "~/lib/models/color-entry";
import { Course } from "~/lib/models/course";
import type { CourseProvider } from "~/lib/models/course-provider";
import { MeetingTime } from "~/lib/models/meeting-time";
import {
	ManualAddCourseButton,
	ManualCourseProvider,
} from "~/lib/providers/manual-course-provider";
import { CourseStore } from "~/lib/stores/course-store";
import { ProviderStore } from "~/lib/stores/provider-store";
import { resolveCurrentStyleColorByIndex } from "~/lib/stores/timetable-preferences";
import { CourseEditorDialog } from "../course-editor/course-editor-dialog";
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
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "../ui/sheet";

function dayName(day: number) {
	const days = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];
	return days[(day - 1) % 7] || "";
}

function CourseCard({ course }: { course: Course }) {
	return (
		<div className="group flex items-start justify-between gap-2 px-4 py-3">
			<div className="flex min-w-0 items-start gap-2.5">
				<div
					className="mt-1 size-2.5 shrink-0 rounded-full"
					style={ColorEntry.getBackgroundStyle(
						course.cellAppearance.background ??
							resolveCurrentStyleColorByIndex(course.themeColorIndex ?? 0),
					)}
				/>
				<div className="min-w-0 space-y-1.5">
					<div>
						<p className="text-sm font-semibold leading-none">{course.code}</p>
						{course.name && (
							<p className="mt-0.5 truncate text-xs text-muted-foreground">
								{course.name}
							</p>
						)}
					</div>
					{course.meetingTimes.length === 0 ? (
						<p className="text-xs text-muted-foreground/60">No meeting times</p>
					) : (
						<ul className="space-y-1">
							{course.meetingTimes.map((time, idx) => (
								<li
									key={idx}
									className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"
								>
									<ClockIcon className="size-3 shrink-0 text-muted-foreground/60" />
									<span className="font-medium text-foreground/80">
										{dayName(time.day)}
									</span>
									<span className="text-muted-foreground">
										{time.time.toString()}
									</span>
									{time.location && (
										<span className="inline-flex items-center gap-1 text-muted-foreground">
											<MapPinIcon className="size-3 shrink-0" />
											{time.location}
										</span>
									)}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-0.5 pt-0.5 opacity-100 transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
				<CourseEditorDialog
					defaultValues={course.toSchema()}
					onSubmit={(data, form) => {
						const conflicts = CourseStore.getState()
							.getConflictingCourses(
								data.meetingTimes.map(MeetingTime.createFromSchema),
							)
							.filter((c) => c.id !== course.id);

						if (conflicts.length > 0) {
							form.setFieldMeta("meetingTimes", (prev) => ({
								...prev,
								errorMap: {
									onSubmit: `There are time conflicts with ${conflicts.map((c) => c.code).join(", ")}.`,
								},
							}));
							return;
						}

						CourseStore.setState((state) => {
							const courseToUpdate = state.courses.find(
								(c) => c.id === course.id,
							)!;
							Course.assignFromSchema(courseToUpdate, data);
						});
					}}
				>
					<Button variant="ghost" size="sm" title="Edit course">
						<PencilIcon className="size-3.5" />
					</Button>
				</CourseEditorDialog>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							title="Remove course"
							className="text-destructive hover:text-white hover:bg-destructive/90 dark:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
						>
							<Trash2Icon className="size-3.5" />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Remove {course.code}?</AlertDialogTitle>
							<AlertDialogDescription>
								This action will remove the course and its meetings from your
								timetable.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => CourseStore.getState().removeCourse(course.id)}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Remove
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}

function AddCourseButton({ provider }: { provider: CourseProvider }) {
	if (provider instanceof ManualCourseProvider)
		return <ManualAddCourseButton />;
	if (provider instanceof UiTMProvider) return <UiTMAddCourseButton />;
	return null;
}

function ProviderEmptyState({ provider }: { provider: CourseProvider }) {
	return (
		<div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
			<p className="max-w-sm text-pretty text-sm text-muted-foreground">
				{provider.emptyStateText ?? "No courses added yet."}
			</p>
			<AddCourseButton provider={provider} />
		</div>
	);
}

function ProviderSection({ provider }: { provider: CourseProvider }) {
	const courses = useProviderCourses(provider);
	const hasCourses = courses.length > 0;

	return (
		<Card className="gap-0 overflow-hidden py-0">
			<div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold">{provider.name}</h2>
					<span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
						{courses.length}
					</span>
				</div>
				{hasCourses && <AddCourseButton provider={provider} />}
			</div>
			{hasCourses ? (
				<div className="divide-y divide-border/60">
					{courses.map((course) => (
						<CourseCard key={course.id} course={course} />
					))}
				</div>
			) : (
				<ProviderEmptyState provider={provider} />
			)}
		</Card>
	);
}

function CourseList() {
	const providers = useStore(ProviderStore, (s) => s.providers).toReversed();

	return (
		<ScrollArea className="min-h-0">
			<div className="space-y-3 px-4 pb-6 pt-1">
				{providers.map((provider, idx) => (
					<ProviderSection key={idx} provider={provider} />
				))}
			</div>
		</ScrollArea>
	);
}

export function CourseManagementSheetRenderer() {
	const {
		_internal: { isOpen, setIsOpen },
	} = useCourseManagementSheet();

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent className="sm:max-w-lg max-sm:w-screen" side="left">
				<SheetHeader>
					<SheetTitle>Course Management</SheetTitle>
					<SheetDescription>
						Import from UiTM or add courses manually.
					</SheetDescription>
				</SheetHeader>
				<CourseList />
			</SheetContent>
		</Sheet>
	);
}
