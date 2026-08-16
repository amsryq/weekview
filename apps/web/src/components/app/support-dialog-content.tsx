import {
	ExternalLinkIcon,
	GithubIcon,
	HeartIcon,
	LoaderCircle,
	Share2Icon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Twemoji } from "~/components/ui/twemoji";
import { ENABLE_AUTH_PAYWALL } from "~/lib/config/feature-flags";
import { useUser } from "~/lib/hooks/user";
import { isString } from "~/lib/utils/predicates";
import { generateCheckout } from "~/server/functions/stripe";

export default function SupportDialogContent({
	config,
}: {
	config: { title: string; description: string; showAlternatives: boolean };
}) {
	if (ENABLE_AUTH_PAYWALL) {
		return <PaywallContent config={config} />;
	}

	return <FreeContent config={config} />;
}

// ─── Paywall Mode ────────────────────────────────────────────────────────────

function PaywallContent({
	config,
}: {
	config: { title: string; description: string; showAlternatives: boolean };
}) {
	return (
		<>
			<DialogHeader>
				<DialogTitle className="text-2xl">{config.title}</DialogTitle>
				<DialogDescription>{config.description}</DialogDescription>
			</DialogHeader>

			<div className="flex flex-col min-h-0 gap-5 overflow-y-auto">
				<SupporterCheckoutCard />

				{config.showAlternatives && (
					<>
						<div className="flex items-center gap-3">
							<Separator className="flex-1" />
							<span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
								or support for free
							</span>
							<Separator className="flex-1" />
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<SponsorLink />
							<ShareButton />
						</div>
					</>
				)}
			</div>
		</>
	);
}

function SupporterCheckoutCard() {
	const [loading, setLoading] = useState(false);
	const user = useUser();
	const isSupporter = user?.supporterUntil && user.supporterUntil > new Date();

	const onSupport = async () => {
		try {
			setLoading(true);

			if (!user) {
				throw new Error("No session found. You must be logged in to support.");
			}

			if (!user.stripeCustomerId) {
				throw new Error("No Stripe customer ID found. Please contact support.");
			}

			const { url } = await generateCheckout();
			if (isString(url) && url) {
				window.open(url, "_blank", "noopener,noreferrer");
			} else {
				throw new Error("No checkout URL returned");
			}
		} catch (err) {
			alert(
				err instanceof Error
					? `Failed to start checkout: ${err.message}`
					: "Failed to start checkout.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative rounded-xl border bg-card p-5 overflow-hidden">
			{/* Decorative accent */}
			<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary/60 via-primary to-primary/60" />

			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
				<div className="space-y-3 flex-1">
					<div className="flex items-center gap-2">
						<HeartIcon className="size-5 text-primary" />
						<h3 className="text-lg font-semibold">Become a Supporter</h3>
					</div>
					<p className="text-sm text-muted-foreground">
						Unlock premium features and help keep the project alive.
					</p>
					<ul className="space-y-1.5 text-sm">
						<li className="flex items-center gap-2">
							<Twemoji emoji="🖼️" /> Background images
						</li>
						<li className="flex items-center gap-2">
							<Twemoji emoji="🌈" /> Gradient colors
						</li>
						<li className="flex items-center gap-2">
							<Twemoji emoji="⭐" /> Icons for cells
						</li>
					</ul>
				</div>

				<div className="flex flex-col items-end gap-2 shrink-0">
					<div className="text-right">
						<div className="text-3xl font-bold tracking-tight">RM10</div>
						<div className="text-xs text-muted-foreground">per month</div>
					</div>
					<Button
						onClick={onSupport}
						disabled={isSupporter || loading}
						size="lg"
						className="w-full sm:w-auto"
					>
						{loading && <LoaderCircle className="size-4 animate-spin" />}
						{isSupporter ? "Already Active" : "Support Now"}
					</Button>
				</div>
			</div>
		</div>
	);
}

// ─── Non-Paywall Mode ────────────────────────────────────────────────────────

function FreeContent({
	config,
}: {
	config: { title: string; description: string; showAlternatives: boolean };
}) {
	return (
		<>
			<DialogHeader>
				<DialogTitle className="text-2xl">{config.title}</DialogTitle>
				<DialogDescription>{config.description}</DialogDescription>
			</DialogHeader>

			<div className="flex flex-col min-h-0 gap-5 overflow-y-auto">
				{/* GitHub Sponsors — primary CTA */}
				<GitHubSponsorsCard />

				{config.showAlternatives && (
					<>
						<div className="flex items-center gap-3">
							<Separator className="flex-1" />
							<span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
								other ways to help
							</span>
							<Separator className="flex-1" />
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<ShareButton />
							<FreeAction
								icon={<TelegramIcon className="size-4" />}
								title="Follow on Telegram"
								description="Follow the channel and get updates about Weekview."
								href="https://t.me/myweekview"
							/>
						</div>
					</>
				)}
			</div>
		</>
	);
}

function GitHubSponsorsCard() {
	return (
		<div className="relative rounded-xl border bg-card p-5 overflow-hidden">
			{/* Decorative accent — pinkish to match GitHub Sponsors branding */}
			<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-400/60 via-pink-500 to-pink-400/60" />

			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
				<div className="space-y-2 flex-1">
					<div className="flex items-center gap-2">
						<HeartIcon className="size-5 text-pink-500" />
						<h3 className="text-lg font-semibold">Sponsor on GitHub</h3>
					</div>
					<p className="text-sm text-muted-foreground max-w-md">
						This project is free to use. If you find it useful, consider
						sponsoring me on GitHub to help cover hosting costs and fuel future
						development.
					</p>
				</div>

				<div className="flex items-center shrink-0">
					<Button asChild size="lg">
						<a
							href="https://github.com/sponsors/amsryq"
							target="_blank"
							rel="noopener noreferrer"
						>
							<GithubIcon className="size-4" />
							Sponsor
							<ExternalLinkIcon className="size-3 opacity-50" />
						</a>
					</Button>
				</div>
			</div>
		</div>
	);
}

// ─── Shared Components ───────────────────────────────────────────────────────

function SponsorLink() {
	return (
		<a
			href="https://github.com/sponsors/amsryq"
			target="_blank"
			rel="noopener noreferrer"
			className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
		>
			<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-pink-500/10 text-pink-500">
				<HeartIcon className="size-4" />
			</div>
			<div className="min-w-0">
				<div className="text-sm font-medium group-hover:text-accent-foreground">
					Sponsor on GitHub
				</div>
				<div className="text-xs text-muted-foreground leading-tight">
					Support the project directly
				</div>
			</div>
		</a>
	);
}

function ShareButton() {
	const [copied, setCopied] = useState(false);
	const url = "window" in globalThis ? globalThis.window.location.origin : "";

	const share = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: "Weekview",
					text: "Check out Weekview — a clean weekly timetable app!",
					url,
				});
				return;
			} catch {
				// fall through to copy
			}
		}

		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			alert("Copy failed. You can manually share the URL.");
		}
	};

	return (
		<button
			type="button"
			onClick={share}
			className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent text-left"
		>
			<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
				<Share2Icon className="size-4" />
			</div>
			<div className="min-w-0">
				<div className="text-sm font-medium group-hover:text-accent-foreground">
					{copied ? "Link Copied!" : "Spread the Word"}
				</div>
				<div className="text-xs text-muted-foreground leading-tight">
					Share Weekview with friends
				</div>
			</div>
		</button>
	);
}

function FreeAction({
	icon,
	title,
	description,
	href,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	href: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
		>
			<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
				{icon}
			</div>
			<div className="min-w-0">
				<div className="text-sm font-medium group-hover:text-accent-foreground">
					{title}
				</div>
				<div className="text-xs text-muted-foreground leading-tight">
					{description}
				</div>
			</div>
		</a>
	);
}

function TelegramIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 48 48"
			className={className}
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill="currentColor"
				d="M41.4193 7.30899C41.4193 7.30899 45.3046 5.79399 44.9808 9.47328C44.8729 10.9883 43.9016 16.2908 43.1461 22.0262L40.5559 39.0159C40.5559 39.0159 40.3401 41.5048 38.3974 41.9377C36.4547 42.3705 33.5408 40.4227 33.0011 39.9898C32.5694 39.6652 24.9068 34.7955 22.2086 32.4148C21.4531 31.7655 20.5897 30.4669 22.3165 28.9519L33.6487 18.1305C34.9438 16.8319 36.2389 13.8019 30.8426 17.4812L15.7331 27.7616C15.7331 27.7616 14.0063 28.8437 10.7686 27.8698L3.75342 25.7055C3.75342 25.7055 1.16321 24.0823 5.58815 22.459C16.3807 17.3729 29.6555 12.1786 41.4193 7.30899Z"
			/>
		</svg>
	);
}
