import { type JSX, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PartialDeep } from "type-fest";
import { Course } from "~/lib/models/course";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { CourseEditorForm } from "./course-editor-form";

export default function CourseEditorDialog({
	children,
	title = "Edit Course",
	defaultValues = undefined,
	onSubmit,
}: {
	children: JSX.Element;
	title?: string;
	defaultValues?: PartialDeep<Course.Schema>;
	onSubmit: (data: Course.Schema, form: UseFormReturn<Course.Schema>) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="w-full max-w-full lg:max-w-6xl max-h-[90vh] overflow-hidden">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						Configure your course details, appearance, and schedule using the
						tabs below.
					</DialogDescription>
				</DialogHeader>

				<CourseEditorForm
					onSubmit={(data, form) => {
						onSubmit(data, form);

						// This is used instead of form.formState.errors because form.formState.errors could be outdated
						const fields = form.getValues();
						const hasError = Object.keys(fields).some(
							(key) => form.getFieldState(key as keyof typeof fields).error,
						);

						if (!hasError) setOpen(false);
					}}
					defaultValues={defaultValues}
				/>
			</DialogContent>
		</Dialog>
	);
}
