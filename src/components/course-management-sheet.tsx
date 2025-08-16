import type { JSX } from "react";
import { useStore } from "zustand";
import type { Course } from "~/lib/models/course";
import { CourseStore } from "~/lib/stores/course-store";
import CourseEditorDialog from "./course-editor-dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
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
				<p>{course.notes}</p>

				<CourseEditorDialog>
					<Button variant="outline" className="mt-2">
						Edit Course
					</Button>
				</CourseEditorDialog>

				<ul>
					{course.meetingTimes.map((time) => (
						<li key={time.id}>
							{time.day}: {time.time.toString()}
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

function Body() {
	const courses = useStore(CourseStore, (s) => s.courses);

	return (
		<div className="p-4">
			{Array.from(courses).map((course) => (
				<CourseCard key={course.id} course={course} />
			))}
		</div>
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
				<Body />
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Close</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
