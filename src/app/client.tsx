"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import React from "react";
import { ThemeProvider } from "~/lib/hooks/use-theme";

const App = dynamic(() => import("./app"), { ssr: false });

const queryClient = new QueryClient();

export function Main() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="weekview-ui-theme">
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
