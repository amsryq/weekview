"use client";

import { useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { ReactNode } from "react";
import { authClient, signOut, useSession } from "~/lib/auth/auth-client";
import { fetchUserSubscriptions } from "~/lib/auth/helpers";
import { getActiveSubscription } from "~/lib/auth/helpers-client";
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

	const {
		data: userSubscriptions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["userSubscriptionInfo", session.data?.user.id],
		enabled: Boolean(session.data),
		queryFn: async () => {
			if (session.data) {
				const subInfo = await fetchUserSubscriptions(session.data.user.id);
				if (subInfo) return subInfo;
			}

			return null;
		},
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
		const { message, status, statusText } = session.error;

		return (
			<Card className="flex flex-col gap-2 p-4">
				<div className="text-md font-semibold text-red-600">
					Failed to load current session
				</div>
				<div className="text-sm text-muted-foreground">
					{message && (
						<>
							{message}
							<br />
						</>
					)}
					{typeof status !== "undefined" && (
						<>
							{statusText} ({status})
						</>
					)}
				</div>
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

	if (isLoading) {
		return (
			<div className="flex gap-2 py-8 justify-center items-center text-center font-semibold">
				<LoaderCircleIcon className="inline w-4 h-4 animate-spin" />
				Loading supporter status...
			</div>
		);
	}

	if (error) {
		return (
			<Card className="flex flex-col gap-2 p-4">
				<div className="text-md font-semibold text-red-600">
					Failed to load supporter status
				</div>
				<div className="text-sm text-muted-foreground">
					{error instanceof Error ? error.message : String(error)}
				</div>
			</Card>
		);
	}

	const userSubscriptionInfo =
		userSubscriptions && getActiveSubscription(userSubscriptions);
	const isSupporter = !!userSubscriptionInfo;

	return (
		<div className="flex flex-col justify-center items-center text-center gap-4 py-4">
			<span className="text-lg font-semibold text-center">
				Welcome {session.data?.user.name}! You are currently{" "}
				{isSupporter ? "a supporter!" : "not a supporter."}
				<br />
				{userSubscriptionInfo?.cancelAtPeriodEnd === true && (
					<span className="text-sm font-normal">
						Your subscription will cancel at{" "}
						{userSubscriptionInfo?.periodEnd?.toDateString()}.
					</span>
				)}
			</span>
			<div className="flex flex-wrap gap-2 justify-center">
				<Button
					disabled={isSupporter}
					onClick={async () => {
						await authClient.subscription.upgrade({
							plan: "supporter",
							// TODO: Proper URLs for these
							successUrl: "/",
							cancelUrl: "/",
						});
					}}
				>
					Become a Supporter
				</Button>
				<Button
					disabled={!isSupporter}
					onClick={async () => {
						await authClient.subscription.cancel({
							returnUrl: "/",
							subscriptionId: userSubscriptionInfo!.id,
						});
					}}
				>
					Unsubscribe
				</Button>
				<Button
					disabled={
						userSubscriptionInfo?.status !== "canceled" &&
						!userSubscriptionInfo?.cancelAtPeriodEnd
					}
					onClick={async () => {
						await authClient.subscription.restore({
							subscriptionId: userSubscriptionInfo!.id,
						});
					}}
				>
					Restore
				</Button>
				<Button
					onClick={async () => {
						await authClient.subscription.billingPortal({
							returnUrl: "/",
						});
					}}
				>
					Manage Subscription
				</Button>
				<Button onClick={() => void signOut()}>Sign out</Button>
			</div>
		</div>
	);
}
