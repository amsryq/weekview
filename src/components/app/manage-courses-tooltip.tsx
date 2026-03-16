import * as PopoverPrimitive from "@radix-ui/react-popover";
import { XIcon } from "lucide-react";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { Button } from "~/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { useCourseManagementSheet } from "~/lib/contexts/course-management-sheet";
import { CourseStore } from "~/lib/stores/course-store";

export function ManageCoursesTooltip({ children }: PropsWithChildren) {
	const coursesCount = useStore(CourseStore, (s) => s.courses.length);
	const {
		_internal: { isOpen: isSheetOpen },
	} = useCourseManagementSheet();
	const [isOpen, setIsOpen] = useState(false);
	const [hasDismissed, setHasDismissed] = useState(() => {
		if (typeof localStorage !== "undefined") {
			return localStorage.getItem("dismissedManageCoursesTooltip") === "true";
		}
		return false;
	});

	const [hasAddedCourse, setHasAddedCourse] = useState(false);
	const prevCoursesCountRef = useRef(coursesCount);

	useEffect(() => {
		if (coursesCount > prevCoursesCountRef.current) {
			setHasAddedCourse(true);
		}
		prevCoursesCountRef.current = coursesCount;
	}, [coursesCount]);

	useEffect(() => {
		if (hasAddedCourse && !hasDismissed && !isSheetOpen) {
			// Small delay to let the sheet close animation finish smoothly
			const timer = setTimeout(() => setIsOpen(true), 300);
			return () => clearTimeout(timer);
		} else {
			setIsOpen(false);
		}
	}, [hasAddedCourse, hasDismissed, isSheetOpen]);

	const handleDismiss = () => {
		setIsOpen(false);
		setHasDismissed(true);
		if (typeof localStorage !== "undefined") {
			localStorage.setItem("dismissedManageCoursesTooltip", "true");
		}
	};

	return (
		<Popover
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) handleDismiss();
			}}
		>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				side="top"
				align="center"
				sideOffset={8}
				className="w-auto p-3 text-sm flex items-center gap-3 shadow-lg max-w-sm bg-foreground text-background border-none"
				onInteractOutside={(e) => {
					e.preventDefault();
				}}
			>
				<span className="font-medium">
					You can add, edit or remove your courses here
				</span>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 shrink-0 text-background/70 hover:text-background hover:bg-background/20"
					onClick={handleDismiss}
				>
					<XIcon className="h-4 w-4" />
				</Button>
				<PopoverPrimitive.Arrow
					className="fill-foreground"
					width={14}
					height={7}
				/>
			</PopoverContent>
		</Popover>
	);
}
