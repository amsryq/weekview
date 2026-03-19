import { LoaderCircle } from "lucide-react";
import { lazy, Suspense } from "react";
import { useCourseManagementSheet } from "~/lib/contexts/course-management-sheet";
import { Sheet, SheetContent } from "../ui/sheet";

const CourseManagementSheetContentLazy = lazy(
	() => import("./course-management-sheet-content"),
);

export function CourseManagementSheetRenderer() {
	const {
		_internal: { isOpen, setIsOpen },
	} = useCourseManagementSheet();

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent
				className="sm:max-w-lg max-sm:w-screen flex flex-col"
				side="left"
			>
				<Suspense
					fallback={
						<div className="flex-1 flex items-center justify-center min-h-0">
							<LoaderCircle className="size-6 animate-spin text-muted-foreground" />
						</div>
					}
				>
					<CourseManagementSheetContentLazy />
				</Suspense>
			</SheetContent>
		</Sheet>
	);
}
