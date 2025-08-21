"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import React from "react";

const App = dynamic(() => import("../../App"), { ssr: false });

const queryClient = new QueryClient();

export function ClientOnly() {
	return (
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	);
}
