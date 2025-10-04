"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PartialDeep } from "type-fest";
import CourseEditorDialog from "~/components/course-editor/course-editor-dialog";
import type { Course } from "../models/course";

interface CourseEditorContextType {
	openCourseEditor: (options: {
		course?: Course;
		defaultValues?: PartialDeep<Course.Schema>;
		title?: string;
		onSubmit: (data: Course.Schema, form: UseFormReturn<Course.Schema>) => void;
	}) => void;
	closeCourseEditor: () => void;
}

const CourseEditorContext = createContext<CourseEditorContextType | null>(null);

export function CourseEditorProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [editorProps, setEditorProps] = useState<{
		title?: string;
		defaultValues?: PartialDeep<Course.Schema>;
		onSubmit: (data: Course.Schema, form: UseFormReturn<Course.Schema>) => void;
	} | null>(null);

	const openCourseEditor = ({
		course,
		defaultValues,
		title = course ? "Edit Course" : "Add Course",
		onSubmit,
	}: {
		course?: Course;
		defaultValues?: PartialDeep<Course.Schema>;
		title?: string;
		onSubmit: (data: Course.Schema, form: UseFormReturn<Course.Schema>) => void;
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
			value={{ openCourseEditor, closeCourseEditor }}
		>
			{children}
			{isOpen && editorProps && (
				<CourseEditorDialog
					title={editorProps.title}
					defaultValues={editorProps.defaultValues}
					onSubmit={(data, form) => {
						editorProps.onSubmit(data, form);

						// Check for errors before closing
						const fields = form.getValues();
						const hasError = Object.keys(fields).some(
							(key) => form.getFieldState(key as keyof typeof fields).error,
						);

						if (!hasError) closeCourseEditor();
					}}
					open={isOpen}
					onOpenChange={setIsOpen}
				/>
			)}
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
