
import { LoaderCircleIcon, RefreshCw } from "lucide-react";
import { ReactNode } from "react";
import { signOut, useSession } from "~/lib/auth/auth-client";
import { generateCheckout, removeSupporter } from "~/server/functions/stripe";
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
	const session = useSession({
		refetchOnWindowFocus: "always",
	});

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
						try {
							const { url } = await generateCheckout();
							if (typeof url === "string" && url) {
								window.open(url, "_blank", "noopener,noreferrer");
							} else {
								throw new Error("No checkout URL returned");
							}
						} catch {
							alert("Failed to initiate supporter checkout.");
						}
					}}
				>
					Support
				</Button>
				<Button variant="outline" onClick={() => void signOut()}>
					Sign out
				</Button>
				{import.meta.env.DEV && (
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
								await removeSupporter();
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
