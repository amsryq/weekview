import { type JSX, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PartialDeep } from "type-fest";
import { useIsUserSupporter } from "~/lib/hooks/user";
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

export function CourseEditorDialog({
	children,
	title = "Edit Course",
	defaultValues = undefined,
	onSubmit,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: {
	children?: JSX.Element;
	title?: string;
	defaultValues?: PartialDeep<Course.Schema>;
	onSubmit: (data: Course.Schema, form: UseFormReturn<Course.Schema>) => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const isSupporter = useIsUserSupporter();
	const [internalOpen, setInternalOpen] = useState(false);

	// Use controlled state if provided, otherwise use internal state
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen =
		controlledOnOpenChange !== undefined
			? controlledOnOpenChange
			: setInternalOpen;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children && <DialogTrigger asChild>{children}</DialogTrigger>}
			<DialogContent className="flex flex-col w-5xl sm:max-w-[90vw] h-[90vh]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						Configure your course details, appearance, and schedule using the
						tabs below.{" "}
						{
							// TODO: Temporary only, hide later
							process.env.NODE_ENV === "development" &&
								isSupporter &&
								"(Supporter)"
						}
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
