import { LoaderCircle } from "lucide-react";
import { lazy, Suspense } from "react";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "../ui/responsive-dialog";

export type TabValue = "styles" | "layout" | "background" | "cells";

interface TimetableCustomizerProps {
	children: React.ReactNode;
	initialTab?: TabValue;
}

const TimetableCustomizerContentLazy = lazy(
	() => import("./timetable-customizer-content"),
);

export function TimetableCustomizer({
	children,
	initialTab,
}: TimetableCustomizerProps) {
	return (
		<ResponsiveDialog>
			<ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
			<ResponsiveDialogContent
				desktopClassName="sm:max-w-4xl h-160 max-h-[85dvh]"
				mobileClassName="h-[75dvh]"
			>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Customize Timetable</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Customize the appearance and layout of your timetable
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<Suspense
					fallback={
						<div className="flex-1 flex items-center justify-center min-h-0">
							<LoaderCircle className="size-6 animate-spin text-muted-foreground" />
						</div>
					}
				>
					<TimetableCustomizerContentLazy initialTab={initialTab} />
				</Suspense>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
