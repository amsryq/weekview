import type { PartialDeep } from "type-fest";
import { type CourseFormApi } from "~/lib/contexts/course-editor";
import { useIsUserSupporter } from "~/lib/hooks/user";
import { Course } from "~/lib/models/course";
import {
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "../ui/responsive-dialog";
import { CourseEditorForm } from "./course-editor-form";

export default function CourseEditorDialogContent({
	title,
	defaultValues,
	onSubmit,
	onDirtyChange,
}: {
	title?: string;
	defaultValues?: PartialDeep<Course.Schema>;
	onSubmit: (data: Course.Schema, form: CourseFormApi) => void;
	onDirtyChange: (isDirty: boolean) => void;
}) {
	const isSupporter = useIsUserSupporter();

	return (
		<>
			<ResponsiveDialogHeader>
				<div className="flex items-center gap-2">
					<ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
					{import.meta.env.DEV && isSupporter && (
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
					onSubmit={onSubmit}
					defaultValues={defaultValues}
					onDirtyChange={onDirtyChange}
				/>
			</div>
		</>
	);
}
