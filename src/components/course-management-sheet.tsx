import { ClockIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { type JSX } from "react";
import { useStore } from "zustand";
import { Course } from "~/lib/models/course";
import type { CourseProvider } from "~/lib/models/course-provider";
import { CourseStore } from "~/lib/stores/course-store";
import { ProviderStore } from "~/lib/stores/provider-store";
import { getBackgroundStyle } from "~/lib/utils/styles";
import CourseEditorDialog from "./course-editor-dialog";
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
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";

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

function CourseCard({
	course,
	start,
	end,
}: {
	course: Course;
	start: boolean;
	end: boolean;
}) {
	return (
		<Card
			className={`gap-0 rounded-none ${start ? "rounded-t-xl" : ""} ${end ? "rounded-b-xl" : ""}`}
		>
			<CardHeader className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div
						className="size-4 rounded-full"
						style={getBackgroundStyle(course.cellAppearance.background)}
					/>
					<div>
						<CardTitle className="text-base leading-none">
							{course.code}
						</CardTitle>
						{course.name && (
							<CardDescription className="text-xs">
								{course.name}
							</CardDescription>
						)}
					</div>
				</div>

				<CardAction className="flex items-center gap-1">
					<CourseEditorDialog
						defaultValues={course.toSchema()}
						onSubmit={(data, form) => {
							if (
								CourseStore.getState().hasTimeConflicts(
									Course.createFromSchema(data),
									course,
								)
							) {
								form.setError("meetingTimes", {
									message: "There are time conflicts with other courses.",
								});
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
							<PencilIcon className="size-4" />
						</Button>
					</CourseEditorDialog>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								title="Remove course"
								className="text-destructive"
							>
								<Trash2Icon className="size-4" />
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
				</CardAction>
			</CardHeader>

			<CardContent className="pt-4">
				{course.meetingTimes.length === 0 ? (
					<p className="text-sm text-muted-foreground">No meeting times</p>
				) : (
					<ul className="space-y-2">
						{course.meetingTimes.map((time, idx) => (
							<li key={idx} className="text-sm flex items-center gap-2">
								<ClockIcon className="size-4 text-muted-foreground" />
								<span className="font-medium">{dayName(time.day)}</span>
								<span className="text-muted-foreground">
									{time.time.toString()}
								</span>
								{time.location && (
									<span className="inline-flex items-center gap-1 text-muted-foreground">
										<MapPinIcon className="size-3.5" /> {time.location}
									</span>
								)}
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

function ProviderSection({ provider }: { provider: CourseProvider }) {
	const courses = provider.useCourses();

	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold flex items-center gap-1">
				{provider.name}
				<span className="text-xs text-muted-foreground">
					({courses.length})
				</span>
			</h2>
			<div className="flex flex-col gap-4 w-full">
				{courses.length > 0 ? (
					<div>
						{courses.map((course, idx) => (
							<CourseCard
								start={idx === 0}
								end={idx === courses.length - 1}
								key={course.id}
								course={course}
							/>
						))}
					</div>
				) : (
					<Card>
						<CardContent className="flex flex-col gap-4 align-center">
							<span className="text-center text-sm text-muted-foreground">
								No courses added from this provider.
							</span>
						</CardContent>
					</Card>
				)}
				<provider.renderAddCourseButton />
			</div>
		</div>
	);
}

function CourseList() {
	const providers = useStore(ProviderStore, (s) => s.providers).toReversed();

	return (
		<ScrollArea className="min-h-0">
			<div className="space-y-4 px-4 pb-4">
				{providers.map((provider, idx) => (
					<ProviderSection key={idx} provider={provider} />
				))}
			</div>
		</ScrollArea>
	);
}

export default function CourseManagementSheet({
	children,
}: {
	children: JSX.Element;
}) {
	return (
		<Sheet>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent className="sm:max-w-lg max-sm:w-screen" side="left">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						Course Management
					</SheetTitle>
					<SheetDescription>
						Manage your selected courses here.
					</SheetDescription>
				</SheetHeader>
				<CourseList />
			</SheetContent>
		</Sheet>
	);
}
