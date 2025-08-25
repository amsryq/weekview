"use client";

import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";
import { authClient, signOut, useSession } from "~/lib/auth/auth-client";
import { fetchUserSubscriptions } from "~/lib/auth/helpers";
import { getActiveSubscription } from "~/lib/auth/helpers-client";
import SignIn from "./sign-in";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

export function AccountManagerDialog({ children }: { children: ReactNode }) {
	const session = useSession();

	const {
		data: userSubscriptions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["userSubscriptionInfo", session.data?.user.id],
		enabled: !!session.data,
		queryFn: async () => {
			if (session.data) {
				const subInfo = await fetchUserSubscriptions(session.data.user.id);
				if (subInfo) return subInfo;
			}

			return null;
		},
	});

	if (!session.data) {
		return (
			<SignIn>
				<Button>Sign In</Button>
			</SignIn>
		);
	}

	if (error) {
		return <div>Error loading supporter status: {error.message}</div>;
	}

	if (isLoading) {
		return <div>Loading supporter status...</div>;
	}

	if (!session.data) {
		return (
			<SignIn>
				<Button>Sign In</Button>
			</SignIn>
		);
	}

	const userSubscriptionInfo =
		userSubscriptions && getActiveSubscription(userSubscriptions);
	const isSupporter = !!userSubscriptionInfo;

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[95vh]">
				<DialogHeader>
					<DialogTitle>Manage Account</DialogTitle>
					<DialogDescription>
						Manage your subscription and account settings here.
					</DialogDescription>
				</DialogHeader>
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
					<div className="flex gap-2 justify-center">
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
			</DialogContent>
		</Dialog>
	);
}
