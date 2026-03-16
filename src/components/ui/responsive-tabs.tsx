import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "~/lib/utils/styles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import {
	VerticalTabs,
	VerticalTabsContent,
	VerticalTabsList,
	VerticalTabsTrigger,
} from "./vertical-tabs";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ResponsiveTabsContextValue {
	isDesktop: boolean;
}

const ResponsiveTabsContext = React.createContext<ResponsiveTabsContextValue>({
	isDesktop: true,
});

export function useResponsiveTabs() {
	return React.useContext(ResponsiveTabsContext);
}

// ---------------------------------------------------------------------------
// useMediaQuery (SSR-safe)
// ---------------------------------------------------------------------------

function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = React.useState(false);

	React.useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) setMatches(media.matches);
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [matches, query]);

	return matches;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

type ResponsiveTabsProps = React.ComponentProps<typeof Tabs> & {
	desktopClassName?: string;
	mobileClassName?: string;
};

function ResponsiveTabs({
	children,
	className,
	desktopClassName,
	mobileClassName,
	...props
}: ResponsiveTabsProps) {
	// sm breakpoint (640px)
	const isDesktop = useMediaQuery("(min-width: 640px)");

	return (
		<ResponsiveTabsContext.Provider value={{ isDesktop }}>
			{isDesktop ? (
				<VerticalTabs className={cn(className, desktopClassName)} {...props}>
					{children}
				</VerticalTabs>
			) : (
				<Tabs className={cn(className, mobileClassName)} {...props}>
					{children}
				</Tabs>
			)}
		</ResponsiveTabsContext.Provider>
	);
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

type ResponsiveTabsListProps = React.ComponentProps<typeof TabsList> & {
	desktopClassName?: string;
	mobileClassName?: string;
	desktopWrapperClassName?: string;
	mobileWrapperClassName?: string;
};

function ResponsiveTabsList({
	className,
	desktopClassName,
	mobileClassName,
	desktopWrapperClassName,
	mobileWrapperClassName,
	...props
}: ResponsiveTabsListProps) {
	const { isDesktop } = useResponsiveTabs();
	const list = isDesktop ? (
		<VerticalTabsList className={cn(className, desktopClassName)} {...props} />
	) : (
		<TabsList className={cn(className, mobileClassName)} {...props} />
	);

	if (isDesktop && desktopWrapperClassName) {
		return <div className={desktopWrapperClassName}>{list}</div>;
	}
	if (!isDesktop && mobileWrapperClassName) {
		return <div className={mobileWrapperClassName}>{list}</div>;
	}
	return list;
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

type ResponsiveTabsTriggerProps = React.ComponentProps<typeof TabsTrigger> & {
	desktopClassName?: string;
	mobileClassName?: string;
};

function ResponsiveTabsTrigger({
	className,
	desktopClassName,
	mobileClassName,
	...props
}: ResponsiveTabsTriggerProps) {
	const { isDesktop } = useResponsiveTabs();
	return isDesktop ? (
		<VerticalTabsTrigger
			className={cn(className, desktopClassName)}
			{...props}
		/>
	) : (
		<TabsTrigger className={cn(className, mobileClassName)} {...props} />
	);
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

type ResponsiveTabsContentProps = React.ComponentProps<typeof TabsContent> & {
	desktopClassName?: string;
	mobileClassName?: string;
	desktopWrapperClassName?: string;
	mobileWrapperClassName?: string;
};

function ResponsiveTabsContent({
	className,
	desktopClassName,
	mobileClassName,
	desktopWrapperClassName,
	mobileWrapperClassName,
	children,
	...props
}: ResponsiveTabsContentProps) {
	const { isDesktop } = useResponsiveTabs();

	const content = isDesktop ? (
		<VerticalTabsContent className={cn(className, desktopClassName)} {...props}>
			{children}
		</VerticalTabsContent>
	) : (
		<TabsContent className={cn(className, mobileClassName)} {...props}>
			{children}
		</TabsContent>
	);

	return (
		<TabsPrimitive.Content {...props} asChild>
			<div className="contents">
				{isDesktop && desktopWrapperClassName ? (
					<div className={desktopWrapperClassName}>{content}</div>
				) : !isDesktop && mobileWrapperClassName ? (
					<div className={mobileWrapperClassName}>{content}</div>
				) : (
					content
				)}
			</div>
		</TabsPrimitive.Content>
	);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
	ResponsiveTabs,
	ResponsiveTabsContent,
	ResponsiveTabsList,
	ResponsiveTabsTrigger,
};
