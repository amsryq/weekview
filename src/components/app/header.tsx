import { HeartIcon, UserIcon } from "lucide-react";
import { AccountManagerDialog } from "~/components/auth/account-manager-dialog";
import { SignIn } from "~/components/auth/sign-in";
import { Logo } from "~/components/brand/logo";
import { ThemeToggle } from "~/components/settings/theme-toggle";
import { Button } from "~/components/ui/button";
import { ENABLE_AUTH_PAYWALL } from "~/lib/config/feature-flags";
import { useSupportDialog } from "~/lib/contexts/support-dialog";
import { useUser } from "~/lib/hooks/user";

function AccountButton() {
	const user = useUser();

	let element = (
		<Button variant="outline">
			<UserIcon className="w-4 h-4" />
			{user ? "Manage Account" : "Sign In"}
		</Button>
	);

	if (user) {
		element = <AccountManagerDialog>{element}</AccountManagerDialog>;
	} else {
		element = <SignIn>{element}</SignIn>;
	}

	return element;
}

function SupportButton() {
	// always call the hook to satisfy rules of hooks
	const { openSupportDialog } = useSupportDialog();

	if (!ENABLE_AUTH_PAYWALL) {
		return (
			<Button asChild variant="outline">
				<a
					href="https://github.com/sponsors/amsryq"
					target="_blank"
					rel="noopener noreferrer"
				>
					<HeartIcon className="w-4 h-4" />
					Support
				</a>
			</Button>
		);
	}

	return (
		<Button
			onClick={() =>
				openSupportDialog({
					title: "Support me!",
					description:
						"Thanks for checking out this project! Even though it started as a hobby, I've spent a lot of time (and some money) building it. Any support you give means a lot!",
					showAlternatives: true,
				})
			}
			variant="outline"
		>
			<HeartIcon className="w-4 h-4" />
			Support
		</Button>
	);
}

function TelegramButton() {
	return (
		<Button asChild variant="outline">
			<a href="https://t.me/myweekview" target="_blank" rel="noreferrer">
				<svg
					viewBox="0 0 48 48"
					className="w-4 h-4 fill-foreground"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M41.4193 7.30899C41.4193 7.30899 45.3046 5.79399 44.9808 9.47328C44.8729 10.9883 43.9016 16.2908 43.1461 22.0262L40.5559 39.0159C40.5559 39.0159 40.3401 41.5048 38.3974 41.9377C36.4547 42.3705 33.5408 40.4227 33.0011 39.9898C32.5694 39.6652 24.9068 34.7955 22.2086 32.4148C21.4531 31.7655 20.5897 30.4669 22.3165 28.9519L33.6487 18.1305C34.9438 16.8319 36.2389 13.8019 30.8426 17.4812L15.7331 27.7616C15.7331 27.7616 14.0063 28.8437 10.7686 27.8698L3.75342 25.7055C3.75342 25.7055 1.16321 24.0823 5.58815 22.459C16.3807 17.3729 29.6555 12.1786 41.4193 7.30899Z" />
				</svg>
				Telegram
			</a>
		</Button>
	);
}

export function Header() {
	return (
		<header className="flex flex-col sm:flex-row items-center justify-between p-6 gap-6 max-w-screen">
			{/** Left side */}
			<h1 className="flex items-center">
				<Logo className="fill-foreground" />
			</h1>

			{/** Right side */}
			<div className="flex flex-wrap justify-center gap-2 flex-row-reverse sm:flex-row">
				<div className="flex gap-2">
					<SupportButton />
					<TelegramButton />
				</div>
				<div className="max-sm:hidden w-px mx-2 bg-border" />
				<div className="flex gap-2">
					<ThemeToggle />
					{ENABLE_AUTH_PAYWALL && <AccountButton />}
				</div>
			</div>
		</header>
	);
}
