import type { AnyFieldMeta } from "@tanstack/react-form";
import { type JSX, useState } from "react";
import type { PartialDeep } from "type-fest";
import { type CourseFormApi } from "~/lib/contexts/course-editor";
import { useIsUserSupporter } from "~/lib/hooks/user";
import { Course } from "~/lib/models/course";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "../ui/responsive-dialog";
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
	onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const isSupporter = useIsUserSupporter();
	const [internalOpen, setInternalOpen] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	// Use controlled state if provided, otherwise use internal state
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen = (newOpen: boolean) => {
		if (!newOpen && isDirty) {
			const confirmClose = window.confirm(
				"You have unsaved changes. Are you sure you want to discard them?",
			);
			if (!confirmClose) return;
		}

		if (controlledOnOpenChange !== undefined) {
			controlledOnOpenChange(newOpen);
		} else {
			setInternalOpen(newOpen);
		}
	};

	const handleFormSubmit = (data: Course.Schema, form: CourseFormApi) => {
		onSubmit(data, form);

		// This is used instead of form.formState.errors because form.formState.errors could be outdated
		const hasError =
			(form.state.errorMap &&
				(form.state.errorMap.onServer !== undefined ||
					form.state.errorMap.onChange !== undefined ||
					form.state.errorMap.onBlur !== undefined ||
					form.state.errorMap.onSubmit !== undefined)) ||
			Object.values(form.state.fieldMeta).some(
				(meta: AnyFieldMeta | undefined) => (meta?.errors?.length ?? 0) > 0,
			);

		if (!hasError) {
			setIsDirty(false);
			setOpen(false);
		}
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={setOpen}>
			{children && (
				<ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
			)}
			<ResponsiveDialogContent
				desktopClassName="w-full max-w-5xl h-[90dvh]"
				mobileClassName="h-[75dvh]"
				sheetSide="bottom"
				onPointerDownOutside={(e) => {
					if (isDirty) e.preventDefault();
				}}
				onEscapeKeyDown={(e) => {
					if (isDirty) e.preventDefault();
				}}
			>
				<ResponsiveDialogHeader>
					<div className="flex items-center gap-2">
						<ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
						{process.env.NODE_ENV === "development" && isSupporter && (
							<span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
								Supporter
							</span>
						)}
					</div>
					<ResponsiveDialogDescription>
						Configure your course details, appearance, and schedule.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
					<CourseEditorForm
						onSubmit={handleFormSubmit}
						defaultValues={defaultValues}
						onDirtyChange={setIsDirty}
					/>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
