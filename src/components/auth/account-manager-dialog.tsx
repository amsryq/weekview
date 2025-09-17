"use client";

import { LoaderCircleIcon, RefreshCw } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { signOut, useSession } from "~/lib/auth/auth-client";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import SignIn from "./sign-in";

export function AccountManagerDialog({ children }: { children: ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Manage Account</DialogTitle>
					<DialogDescription>
						Manage your subscription and account settings here.
					</DialogDescription>
				</DialogHeader>
				<AccountManagerPanel />
			</DialogContent>
		</Dialog>
	);
}

function AccountManagerPanel() {
	const session = useSession();

	// Refetch session data when window gains focus to ensure up-to-date info after payment
	// biome-ignore lint/correctness/useExhaustiveDependencies: Only want to run this on mount
	useEffect(() => {
		if (!session.data) return;

		const handleFocus = () => {
			if (session.data && !session.isPending) session.refetch();
		};

		window.addEventListener("focus", handleFocus);
		return () => window.removeEventListener("focus", handleFocus);
	}, []);

	if (session.isPending) {
		return (
			<div className="flex gap-2 py-8 justify-center items-center text-center font-semibold">
				<LoaderCircleIcon className="inline w-4 h-4 animate-spin" />
				Loading session...
			</div>
		);
	}

	if (session.error) {
		return (
			<Card className="flex flex-col gap-2 p-4">
				<div className="text-md font-semibold text-red-600">
					Failed to load current session
				</div>
				<div className="text-sm text-muted-foreground">
					{session.error instanceof Error
						? session.error.message
						: "Unknown error"}
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => session.refetch()}
					className="w-fit"
				>
					<RefreshCw className="h-3 w-3 mr-2" />
					Retry
				</Button>
			</Card>
		);
	}

	if (!session.data) {
		return (
			<SignIn>
				<Button>Sign In</Button>
			</SignIn>
		);
	}

	const supporterUntil = session.data.user.supporterUntil;
	const isSupporter = supporterUntil
		? supporterUntil.getTime() > Date.now()
		: false;

	return (
		<div className="flex flex-col justify-center items-center text-center gap-4 py-4">
			<span className="text-lg font-semibold text-center">
				Welcome {session.data?.user.name}! You are currently{" "}
				{isSupporter ? "a supporter!" : "not a supporter."}
				<br />
				{isSupporter && supporterUntil && (
					<span className="text-sm font-normal">
						Your supporter status will end at {supporterUntil.toDateString()}.
					</span>
				)}
			</span>
			<div className="flex flex-wrap gap-2 justify-center">
				<Button
					disabled={isSupporter}
					onClick={async () => {
						const req = await fetch(
							new URL(
								`/api/supporter/generate-checkout`,
								process.env.NEXT_PUBLIC_BACKEND_URL,
							),
							{
								credentials: "include",
							},
						);

						try {
							const { url } = await req.json();
							window.open(url, "_blank", "noopener,noreferrer");
						} catch {
							// TODO: Toast notification or something
							alert("Failed to initiate supporter checkout.");
						}
					}}
				>
					Support
				</Button>
				<Button variant="outline" onClick={() => void signOut()}>
					Sign out
				</Button>
				{process.env.NODE_ENV === "development" && (
					<>
						<Button
							variant="outline"
							onClick={() => session.refetch()}
							title="Refresh account information"
						>
							Refresh
						</Button>
						<Button
							disabled={!isSupporter}
							variant="destructive"
							title="Remove Supporter Status (Dev Only)"
							onClick={async () => {
								await fetch(
									new URL(
										`/api/supporter/remove-supporter`,
										process.env.NEXT_PUBLIC_BACKEND_URL,
									),
									{
										method: "POST",
										credentials: "include",
									},
								);
								// Refresh session instead of reloading the page
								session.refetch();
							}}
						>
							Unsupport
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
