
import { Lock, LucideIcon } from "lucide-react";
import { usePaywall } from "~/lib/hooks/paywall";
import { cn } from "~/lib/utils/styles";
import { Button } from "./ui/button";

interface PaywallOverlayProps {
	/**
	 * The title of the premium feature
	 * @default "Premium Feature"
	 */
	title?: string;
	/**
	 * The description text explaining the feature is premium
	 * @default "This feature is available for supporters only. Unlock this feature and support the project!"
	 */
	description?: string;
	/**
	 * Custom icon to display instead of the default Lock icon
	 */
	icon?: LucideIcon;
	/**
	 * Text for the primary action button
	 * @default "Become a Supporter"
	 */
	primaryButtonText?: string;
	/**
	 * Custom className for the overlay container
	 */
	className?: string;
	/**
	 * Whether the overlay should be visible
	 * If not provided, it will automatically check supporter status
	 */
	visible?: boolean;
	/**
	 * Whether to use a compact layout for smaller areas
	 * @default false
	 */
	compact?: boolean;
	/**
	 * Whether to bypass the paywall and always show children
	 * @default false
	 */
	bypass?: boolean;
	/**
	 * Children to render behind the overlay when not a supporter
	 */
	children?: React.ReactNode;
}

/**
 * A reusable paywall overlay component that displays over content
 * when a user is not a supporter. Automatically handles supporter
 * status checking and support dialog opening.
 */
export function PaywallOverlay({
	title = "Premium Feature",
	description = "This feature is available for supporters only. Unlock this feature and support the project!",
	icon: Icon = Lock,
	className,
	visible,
	compact = false,
	bypass = false,
	primaryButtonText = compact ? "Unlock now" : "Learn more",
	children,
}: PaywallOverlayProps) {
	const { isSupporter, checkAccess } = usePaywall();

	// If visible prop is provided, use it; otherwise check supporter status
	const shouldShowOverlay =
		!bypass && (visible !== undefined ? visible : !isSupporter);

	if (!shouldShowOverlay) {
		return <>{children}</>;
	}

	return (
		<div className={cn("relative", className)}>
			{children}
			<div className="absolute inset-0 bg-background/90 flex items-center justify-center z-10">
				{compact ? (
					<div className="flex items-center justify-around w-full text-center gap-2 p-3">
						<div className="flex items-center justify-center gap-2">
							<Icon className="w-4 h-4 text-muted-foreground" />
							<h4 className="font-medium text-sm">{title}</h4>
						</div>
						<Button
							variant="secondary"
							size="sm"
							onClick={() => checkAccess()}
							className="text-xs"
						>
							{primaryButtonText}
						</Button>
					</div>
				) : (
					<div className="text-center space-y-4 p-6">
						<div className="flex justify-center">
							<div className="p-3 rounded-full bg-muted">
								<Icon className="w-6 h-6 text-muted-foreground" />
							</div>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold text-lg">{title}</h3>
							<p className="text-sm text-muted-foreground max-w-sm">
								{description}
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-2 justify-center">
							<Button
								variant="secondary"
								onClick={() => checkAccess()}
								className="min-w-[120px]"
							>
								{primaryButtonText}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
