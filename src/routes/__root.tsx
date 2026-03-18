/// <reference types="vite/client" />

import { QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
	useBlocker,
} from "@tanstack/react-router";
import { useStore } from "zustand";
import { SupportDialog } from "~/components/app/support-dialog";
import { CourseManagementSheetRenderer } from "~/components/course-management/course-management-sheet";
import { Toaster } from "~/components/ui/sonner";
import {
	ManualImporterDialogRenderer,
	UiTMImporterDialogRenderer,
} from "~/features/uitm/components/importer-dialog";
import globalsCss from "~/globals.css?url";
import {
	CourseEditorDialogRenderer,
	CourseEditorProvider,
} from "~/lib/contexts/course-editor";
import { CourseManagementSheetProvider } from "~/lib/contexts/course-management-sheet";
import { ImporterDialogsProvider } from "~/lib/contexts/importer-dialogs";
import { getQueryClient } from "~/lib/contexts/react-query";
import { SupportDialogProvider } from "~/lib/contexts/support-dialog";
import { ThemeProvider } from "~/lib/contexts/themes";
import { CourseStore } from "~/lib/stores/course-store";
import { buildGoogleFontsUrl, PREDEFINED_FONTS } from "~/lib/utils/fonts";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content:
					"width=device-width, initial-scale=1, maximum-scale=1, interactive-widget=resizes-content",
			},
			{
				title: "Weekview",
			},
			{
				name: "description",
				content:
					"Generate stunning weekly schedules effortlessly for your classes.",
			},
		],
		links: [
			{ rel: "stylesheet", href: globalsCss },
			{ rel: "stylesheet", href: buildGoogleFontsUrl(PREDEFINED_FONTS) },
			{ rel: "icon", href: "/icon.svg" },
		],
	}),
	shellComponent: RootDocument,
	component: RootComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('weekview-ui-theme');if(!t||t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.add(t);}catch(e){}})();`,
					}}
				/>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function GlobalNavigationBlocker() {
	const hasCourses = useStore(CourseStore, (s) => s.courses.length > 0);

	useBlocker({
		shouldBlockFn: () => {
			if (!hasCourses) return false;
			return !window.confirm(
				"You have courses that will be lost. Are you sure you want to leave?",
			);
		},
		enableBeforeUnload: () => hasCourses,
	});

	return null;
}

function RootComponent() {
	const queryClient = getQueryClient();

	return (
		<ThemeProvider defaultTheme="system" storageKey="weekview-ui-theme">
			<QueryClientProvider client={queryClient}>
				<SupportDialogProvider>
					<CourseManagementSheetProvider>
						<ImporterDialogsProvider>
							<CourseEditorProvider>
								<div className="root">
									<Outlet />
								</div>
								<GlobalNavigationBlocker />
								<SupportDialog />
								<CourseEditorDialogRenderer />
								<CourseManagementSheetRenderer />
								<UiTMImporterDialogRenderer />
								<ManualImporterDialogRenderer />
							</CourseEditorProvider>
						</ImporterDialogsProvider>
					</CourseManagementSheetProvider>
				</SupportDialogProvider>
			</QueryClientProvider>
			<Toaster />
		</ThemeProvider>
	);
}
