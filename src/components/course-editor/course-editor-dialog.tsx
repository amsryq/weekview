import type { AnyFieldMeta } from "@tanstack/react-form";
import { type JSX, useEffect, useState } from "react";
import type { PartialDeep } from "type-fest";
import { type CourseFormApi } from "~/lib/contexts/course-editor";
import { useIsUserSupporter } from "~/lib/hooks/user";
import { Course } from "~/lib/models/course";
import { cn } from "~/lib/utils/styles";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";
import { CourseEditorForm } from "./course-editor-form";

function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [matches, query]);

	return matches;
}

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
	const isDesktop = useMediaQuery("(min-width: 768px)");

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

	const header = (
		<>
			<div className="flex items-center gap-2">
				{isDesktop ? <DialogTitle>{title}</DialogTitle> : <SheetTitle>{title}</SheetTitle>}
				{process.env.NODE_ENV === "development" && isSupporter && (
					<span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
						Supporter
					</span>
				)}
			</div>
			{isDesktop ? (
				<DialogDescription>
					Configure your course details, appearance, and schedule.
				</DialogDescription>
			) : (
				<SheetDescription>
					Configure your course details, appearance, and schedule.
				</SheetDescription>
			)}
		</>
	);

	const content = (
		<CourseEditorForm
			onSubmit={handleFormSubmit}
			defaultValues={defaultValues}
			onDirtyChange={setIsDirty}
		/>
	);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				{children && <DialogTrigger asChild>{children}</DialogTrigger>}
				<DialogContent
					className="flex flex-col w-full max-w-5xl h-[90vh] p-0 overflow-hidden"
					onPointerDownOutside={(e) => {
						if (isDirty) e.preventDefault();
					}}
					onEscapeKeyDown={(e) => {
						if (isDirty) e.preventDefault();
					}}
				>
					<DialogHeader className="px-6 pt-6">
						{header}
					</DialogHeader>
					<div className="flex-1 overflow-hidden">{content}</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			{children && <SheetTrigger asChild>{children}</SheetTrigger>}
			<SheetContent
				side="bottom"
				className="h-[95vh] p-0 flex flex-col overflow-hidden rounded-t-2xl"
				onPointerDownOutside={(e) => {
					if (isDirty) e.preventDefault();
				}}
				onEscapeKeyDown={(e) => {
					if (isDirty) e.preventDefault();
				}}
			>
				<SheetHeader className="px-6 pt-6">
					{header}
				</SheetHeader>
				<div className="flex-1 overflow-hidden">{content}</div>
			</SheetContent>
		</Sheet>
	);
}
