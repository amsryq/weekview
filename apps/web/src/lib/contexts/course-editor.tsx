import { type AnyFieldMeta } from "@tanstack/react-form";
import { createContext, type ReactNode, useContext, useState } from "react";
import type { PartialDeep } from "type-fest";
import { CourseEditorDialog } from "~/components/course-editor/course-editor-dialog";
import { useCourseForm } from "~/components/course-editor/hooks/use-course-form";
import { Course } from "../models/course";

export type CourseFormApi = ReturnType<typeof useCourseForm>["form"];

type EditorProps = {
	title?: string;
	defaultValues?: PartialDeep<Course.Schema>;
	onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
};

export const CourseEditorFormContext = createContext<CourseFormApi | null>(
	null,
);

export function useCourseEditorForm() {
	const context = useContext(CourseEditorFormContext);
	if (!context) {
		throw new Error(
			"useCourseEditorForm must be used within a CourseEditorFormContext",
		);
	}
	return context;
}

interface CourseEditorContextType {
	openCourseEditor: (options: {
		course?: Course;
		defaultValues?: PartialDeep<Course.Schema>;
		title?: string;
		onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	}) => void;
	closeCourseEditor: () => void;
	/** Internal — consumed by CourseEditorDialogRenderer. Do not use in application code. */
	_internal: {
		isOpen: boolean;
		setIsOpen: (open: boolean) => void;
		editorProps: EditorProps | null;
	};
}

const CourseEditorContext = createContext<CourseEditorContextType | null>(null);

export function CourseEditorProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [editorProps, setEditorProps] = useState<EditorProps | null>(null);

	const openCourseEditor = ({
		course,
		defaultValues,
		title = course ? "Edit Course" : "Add Course",
		onSubmit,
	}: {
		course?: Course;
		defaultValues?: PartialDeep<Course.Schema>;
		title?: string;
		onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	}) => {
		setEditorProps({
			title,
			defaultValues: defaultValues ?? course?.toSchema(),
			onSubmit,
		});
		setIsOpen(true);
	};

	const closeCourseEditor = () => {
		setIsOpen(false);
		setEditorProps(null);
	};

	return (
		<CourseEditorContext.Provider
			value={{
				openCourseEditor,
				closeCourseEditor,
				_internal: { isOpen, setIsOpen, editorProps },
			}}
		>
			{children}
		</CourseEditorContext.Provider>
	);
}

export function useCourseEditor() {
	const context = useContext(CourseEditorContext);
	if (!context) {
		throw new Error(
			"useCourseEditor must be used within a CourseEditorProvider",
		);
	}
	return context;
}

/**
 * Renders the CourseEditorDialog as a global singleton.
 * Mount this once in the root layout alongside <Toaster> and <SupportDialog>.
 */
export function CourseEditorDialogRenderer() {
	const {
		closeCourseEditor,
		_internal: { isOpen, setIsOpen, editorProps },
	} = useCourseEditor();

	if (!isOpen || !editorProps) return null;

	return (
		<CourseEditorDialog
			title={editorProps.title}
			defaultValues={editorProps.defaultValues}
			onSubmit={(data, form) => {
				editorProps.onSubmit(data, form);

				const hasError =
					(form.state.errorMap &&
						(form.state.errorMap.onServer !== undefined ||
							form.state.errorMap.onChange !== undefined ||
							form.state.errorMap.onBlur !== undefined ||
							form.state.errorMap.onSubmit !== undefined)) ||
					Object.values(form.state.fieldMeta).some(
						(meta: AnyFieldMeta | undefined) => (meta?.errors?.length ?? 0) > 0,
					);

				if (!hasError) closeCourseEditor();
			}}
			open={isOpen}
			onOpenChange={setIsOpen}
		/>
	);
}
