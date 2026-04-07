import type { AnyFieldMeta } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { type JSX, lazy, Suspense, useState } from "react";
import type { PartialDeep } from "type-fest";
import { type CourseFormApi } from "~/lib/contexts/course-editor";
import { Course } from "~/lib/models/course";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogTrigger,
} from "../ui/responsive-dialog";

const CourseEditorDialogContentLazy = lazy(
	() => import("./course-editor-dialog-content"),
);

export function CourseEditorDialog({
	children,
	title = "Edit Course",
	defaultValues = undefined,
	courseId,
	onSubmit,
	onDelete,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: {
	children?: JSX.Element;
	title?: string;
	defaultValues?: PartialDeep<Course.Schema>;
	courseId?: string;
	onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	onDelete?: (courseId: string) => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
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
			if (controlledOnOpenChange !== undefined) {
				controlledOnOpenChange(false);
			} else {
				setInternalOpen(false);
			}
		}
	};

	const handleDelete = () => {
		if (!courseId || !onDelete) return;

		onDelete(courseId);
		setIsDirty(false);

		if (controlledOnOpenChange !== undefined) {
			controlledOnOpenChange(false);
		} else {
			setInternalOpen(false);
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
				onPointerDownOutside={(e: Event) => {
					if (isDirty) e.preventDefault();
				}}
				onEscapeKeyDown={(e: KeyboardEvent) => {
					if (isDirty) e.preventDefault();
				}}
			>
				<Suspense
					fallback={
						<div className="flex-1 flex items-center justify-center min-h-0 py-12">
							<LoaderCircle className="size-6 animate-spin text-muted-foreground" />
						</div>
					}
				>
					<CourseEditorDialogContentLazy
						title={title}
						defaultValues={defaultValues}
						onSubmit={handleFormSubmit}
						onDirtyChange={setIsDirty}
						onDelete={courseId ? handleDelete : undefined}
					/>
				</Suspense>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
