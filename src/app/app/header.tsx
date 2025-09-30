"use client";

import { UserIcon } from "lucide-react";
import { AccountManagerDialog } from "~/components/auth/account-manager-dialog";
import SignIn from "~/components/auth/sign-in";
import Logo from "~/components/brand/logo";
import { ThemeToggle } from "~/components/settings/theme-toggle";
import { Button } from "~/components/ui/button";
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

export const Header = () => (
	<header className="flex justify-between p-4">
		{/** Left side */}
		<h1 className="flex items-center">
			<Logo className="fill-foreground" />
		</h1>

		{/** Right side */}
		<div className="flex gap-2">
			<ThemeToggle />
			<AccountButton />
		</div>
	</header>
);
