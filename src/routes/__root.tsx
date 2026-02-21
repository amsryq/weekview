/// <reference types="vite/client" />
import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRoute,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { CourseEditorDialogRenderer, CourseEditorProvider } from "~/lib/contexts/course-editor";
import { getQueryClient } from "~/lib/contexts/react-query";
import { SupportDialogProvider } from "~/lib/contexts/support-dialog";
import { ThemeProvider } from "~/lib/contexts/themes";
import { SupportDialog } from "~/components/support-dialog";
import { Toaster } from "~/components/ui/sonner";
import { buildGoogleFontsUrl, PREDEFINED_FONTS } from "~/lib/utils/fonts";
import globalsCss from "~/globals.css?url";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
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
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}

function RootComponent() {
    const queryClient = getQueryClient();

    return (
        <ThemeProvider defaultTheme="system" storageKey="weekview-ui-theme">
            <QueryClientProvider client={queryClient}>
                <SupportDialogProvider>
                    <CourseEditorProvider>
                        <div className="root">
                            <Outlet />
                        </div>
                        <SupportDialog />
                        <CourseEditorDialogRenderer />
                    </CourseEditorProvider>
                </SupportDialogProvider>
            </QueryClientProvider>
            <Toaster />
        </ThemeProvider>
    );
}
