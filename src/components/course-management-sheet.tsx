import type { JSX } from "react";
import { useStore } from "zustand";
import { Course } from "~/lib/models/course";
import type { CourseProvider } from "~/lib/models/course-provider";
import { CourseStore } from "~/lib/stores/course-store";
import { ProviderStore } from "~/lib/stores/provider-store";
import CourseEditorDialog from "./course-editor-dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";

function CourseCard({ course }: { course: Course }) {
	return (
		<Card>
			<CardContent>
				<h1 className="scroll-m-20 text-xl font-bold tracking-tight text-balance">
					{course.code}
				</h1>
				<h3>{course.name}</h3>

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
							// Writable version of this
							const courseToUpdate = state.courses.find(
								(c) => c.id === course.id,
							)!;

							Course.assignFromSchema(courseToUpdate, data);
						});
					}}
				>
					<Button variant="outline" className="mt-2">
						Edit Course
					</Button>
				</CourseEditorDialog>

				<ul>
					{course.meetingTimes.map((time, idx) => (
						<li key={idx}>
							{time.day}: {time.time.toString()}
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

function ProviderSection({ provider }: { provider: CourseProvider }) {
	const courses = provider.useCourses();

	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold">{provider.name}</h2>
			<div className="space-y-4">
				{courses.map((course) => (
					<CourseCard key={course.id} course={course} />
				))}
			</div>
		</div>
	);
}

function CourseList() {
	const providers = useStore(ProviderStore, (s) => s.providers);

	return (
		<ScrollArea className="overflow-auto h-auto">
			<div className="space-y-4 px-4 pb-4">
				{providers.map((provider, idx) => (
					<ProviderSection key={idx} provider={provider} />
				))}

				<CourseEditorDialog
					title="Add Course"
					onSubmit={(data, form) => {
						const course = Course.createFromSchema(data);

						if (CourseStore.getState().hasTimeConflicts(course)) {
							form.setError("meetingTimes", {
								message: "There are time conflicts with existing courses.",
							});
							return;
						}

						CourseStore.getState().addCourse(course);
					}}
				>
					<Button className="w-full">Add Course</Button>
				</CourseEditorDialog>
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
			<SheetContent className="sm:max-w-lg" side="left">
				<SheetHeader>
					<SheetTitle>Course Management</SheetTitle>
					<SheetDescription>
						Manage your selected courses here.
					</SheetDescription>
				</SheetHeader>
				<CourseList />
			</SheetContent>
		</Sheet>
	);
}
