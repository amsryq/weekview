import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "~/lib/utils/styles";

function VerticalTabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="vertical-tabs"
			className={cn("flex flex-row h-full w-full", className)}
			orientation="vertical"
			{...props}
		/>
	);
}

function VerticalTabsList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="vertical-tabs-list"
			className={cn(
				"flex flex-col h-full w-48 shrink-0 items-stretch justify-start gap-1 p-2 border-r bg-muted/5",
				className,
			)}
			{...props}
		/>
	);
}

function VerticalTabsTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="vertical-tabs-trigger"
			className={cn(
				"inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all text-muted-foreground",
				"hover:bg-accent hover:text-accent-foreground",
				"data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-sm",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"disabled:pointer-events-none disabled:opacity-50",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				"justify-start text-left",
				className,
			)}
			{...props}
		/>
	);
}

function VerticalTabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="vertical-tabs-content"
			className={cn(
				"flex-1 outline-none min-h-0 overflow-y-auto p-6",
				className,
			)}
			{...props}
		/>
	);
}

export {
	VerticalTabs,
	VerticalTabsContent,
	VerticalTabsList,
	VerticalTabsTrigger,
};
