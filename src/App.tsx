import { useQuery } from "@tanstack/react-query";
import {
	DownloadIcon,
	ImportIcon,
	Settings,
	SlidersHorizontal,
} from "lucide-react";
import { domToPng } from "modern-screenshot";
import CourseManagementSheet from "./components/course-management-sheet";
import SignIn from "./components/sign-in";
import { ThemeToggle } from "./components/theme-toggle";
import TimetableCustomizer from "./components/timetable-customizer";
import { Button } from "./components/ui/button";
import WeeklyTimetable from "./components/weekly-timetable";
import { authClient, signOut, useSession } from "./lib/auth/auth-client";
import { getUserSubscriptionInfo } from "./lib/auth/helpers";
import TechnoUniversityImporterDialog from "./lib/providers/techno-university-provider/importer-dialog";

function AccountPanel() {
	const session = useSession();

	const {
		data: userSubscriptionInfo,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["userSubscriptionInfo", session.data?.user.id],
		enabled: !!session.data,
		queryFn: async () => {
			if (session.data) {
				const subInfo = await getUserSubscriptionInfo(session.data.user.id);
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

	const isSupporter =
		userSubscriptionInfo?.status === "active" ||
		userSubscriptionInfo?.status === "trialing";

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
	);
}

function App() {
	// TODO: Export button instead or both and show save file picker?
	const handleDownloadPng = async () => {
		const node = document.querySelector(
			"#weekly-timetable",
		) as HTMLElement | null;

		if (!node) {
			// TODO: Should error and alert the user here
			return;
		}

		const padding = 16;
		const borderRadius = 8;

		const dataUrl = await domToPng(node, {
			scale: 3,
			// Needs recalculation because we're adding padding
			width: node.scrollWidth + padding * 2,
			height: node.scrollHeight + padding * 2,
			style: {
				padding: `${padding}px`,
				borderRadius: `${borderRadius}px`,
			},
		});

		const link = document.createElement("a");
		link.download = "timetable.png";
		link.href = dataUrl;
		link.click();
	};

	return (
		<div className="flex flex-col items-center justify-center container h-screen mx-auto p-4 w-full">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>

			<AccountPanel />

			<div className="m-4 flex flex-wrap justify-center gap-2">
				<CourseManagementSheet>
					<Button variant="outline">
						<Settings className="w-4 h-4" />
						Manage Courses
					</Button>
				</CourseManagementSheet>
				<TechnoUniversityImporterDialog>
					<Button variant="outline">
						<ImportIcon className="w-4 h-4" />
						Import from Techno University
					</Button>
				</TechnoUniversityImporterDialog>
				<TimetableCustomizer>
					<Button variant="outline">
						<SlidersHorizontal className="w-4 h-4" />
						Customize
					</Button>
				</TimetableCustomizer>
				<Button onClick={handleDownloadPng}>
					<DownloadIcon className="w-4 h-4" />
					Download as PNG
				</Button>
			</div>
			<WeeklyTimetable containerId="weekly-timetable" />
		</div>
	);
}

export default App;
