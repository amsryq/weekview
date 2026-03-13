import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./sheet";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ResponsiveDialogContextValue {
	isDesktop: boolean;
}

const ResponsiveDialogContext =
	React.createContext<ResponsiveDialogContextValue>({ isDesktop: true });

function useResponsiveDialog() {
	return React.useContext(ResponsiveDialogContext);
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

type SharedRootProps = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultOpen?: boolean;
	children?: React.ReactNode;
};

function ResponsiveDialog({ children, ...props }: SharedRootProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	return (
		<ResponsiveDialogContext.Provider value={{ isDesktop }}>
			{isDesktop ? (
				<Dialog {...props}>{children}</Dialog>
			) : (
				<Sheet {...props}>{children}</Sheet>
			)}
		</ResponsiveDialogContext.Provider>
	);
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

function ResponsiveDialogTrigger({
	children,
	...props
}: React.ComponentProps<typeof DialogTrigger>) {
	const { isDesktop } = useResponsiveDialog();
	return isDesktop ? (
		<DialogTrigger {...props}>{children}</DialogTrigger>
	) : (
		<SheetTrigger {...props}>{children}</SheetTrigger>
	);
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

type ResponsiveDialogContentProps = Omit<
	React.ComponentProps<typeof DialogContent>,
	"side"
> & {
	/** Extra className applied only on desktop (Dialog). */
	desktopClassName?: string;
	/** Extra className applied only on mobile (Sheet). */
	mobileClassName?: string;
	/** Side of the Sheet (mobile only). Defaults to "bottom". */
	sheetSide?: "top" | "right" | "bottom" | "left";
};

function ResponsiveDialogContent({
	children,
	className,
	desktopClassName,
	mobileClassName,
	sheetSide = "bottom",
	...props
}: ResponsiveDialogContentProps) {
	const { isDesktop } = useResponsiveDialog();

	if (isDesktop) {
		return (
			<DialogContent className={`${className ?? ""} ${desktopClassName ?? ""}`.trim()} {...props}>
				{children}
			</DialogContent>
		);
	}

	return (
		<SheetContent
			side={sheetSide}
			className={`${className ?? ""} ${mobileClassName ?? ""}`.trim()}
			{...props}
		>
			{children}
		</SheetContent>
	);
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function ResponsiveDialogHeader({
	...props
}: React.ComponentProps<typeof DialogHeader>) {
	const { isDesktop } = useResponsiveDialog();
	return isDesktop ? <DialogHeader {...props} /> : <SheetHeader {...props} />;
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

function ResponsiveDialogTitle({
	...props
}: React.ComponentProps<typeof DialogTitle>) {
	const { isDesktop } = useResponsiveDialog();
	return isDesktop ? <DialogTitle {...props} /> : <SheetTitle {...props} />;
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

function ResponsiveDialogDescription({
	...props
}: React.ComponentProps<typeof DialogDescription>) {
	const { isDesktop } = useResponsiveDialog();
	return isDesktop ? (
		<DialogDescription {...props} />
	) : (
		<SheetDescription {...props} />
	);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
	useResponsiveDialog,
};
