"use client";

import { LoaderCircle, Share2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Twemoji } from "~/components/ui/twemoji";
import { useSupportDialog } from "~/lib/contexts/support-dialog";
import { useUser } from "~/lib/hooks/user";
import { fetchFromBackend } from "~/lib/utils/backend";

export function SupportDialog() {
	const { isOpen, config, closeSupportDialog } = useSupportDialog();

	return (
		<Dialog open={isOpen} onOpenChange={closeSupportDialog}>
			<DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-scroll sm:overflow-y-visible">
				{/* Star sticker */}
				<div className="hidden sm:inline-block absolute right-16 -top-2 rotate-6 select-none">
					<Twemoji emoji="⭐" className="block scale-500 drop-shadow" />
				</div>

				<DialogHeader>
					<DialogTitle className="text-2xl">{config.title}</DialogTitle>
					<DialogDescription>{config.description}</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col min-h-0 gap-4 overflow-y-auto">
					<SupporterCard />
					{config.showAlternatives && (
						<>
							<span className="text-center">or you can</span>
							<div className="flex flex-col md:flex-row [&>*]:flex-1 gap-4">
								<GithubSponsorsCard />
								<ShareCard />
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function SupporterCard() {
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

			const req = await fetchFromBackend("/supporter/generate-checkout");
			const { url } = await req.json();
			if (typeof url === "string" && url) {
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
		<Card className="gap-2 h-full">
			<CardHeader>
				<CardTitle className="text-xl">Become a Supporter</CardTitle>
				<CardDescription>
					You can get additional perks by becoming a supporter:
				</CardDescription>
				<CardAction className="text-right">
					<div className="text-4xl font-semibold">RM10</div>
					<div className="italic">for a month access</div>
				</CardAction>
			</CardHeader>
			<CardContent className="pt-4">
				<ul className="space-y-2 text-md">
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
			</CardContent>
			<CardFooter className="justify-end">
				<Button onClick={onSupport} disabled={isSupporter || loading}>
					{loading && <LoaderCircle className="mr-2 size-4 animate-spin" />}
					{isSupporter ? "Active" : "Support"}
				</Button>
			</CardFooter>
		</Card>
	);
}

function GithubSponsorsCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Sponsor on GitHub</CardTitle>
				<CardDescription className="mr-4">
					If you'd like to sponsor me on GitHub, that's awesome!
				</CardDescription>
				<CardAction>
					<Twemoji
						emoji="❤️"
						className="block translate-y-4 -translate-x-4 scale-300 rotate-6"
					/>
				</CardAction>
			</CardHeader>
			<CardFooter className="justify-end pt-0">
				<Button asChild variant="outline">
					<Link
						href="https://github.com/sponsors/amsryq"
						target="_blank"
						rel="noopener noreferrer"
					>
						Sponsor
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

function ShareCard() {
	const [copied, setCopied] = useState(false);
	const url = typeof window !== "undefined" ? window.location.origin : "";

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
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Share with your friends</CardTitle>
				<CardDescription>
					Not ready to chip in? You can still help by spreading the word!
				</CardDescription>
				<CardAction>
					<Share2Icon className="size-12 -rotate-6 text-muted-foreground" />
				</CardAction>
			</CardHeader>
			<CardFooter className="justify-end pt-0">
				<Button variant="outline" onClick={share}>
					{copied ? "Copied" : "Share"}
				</Button>
			</CardFooter>
		</Card>
	);
}
