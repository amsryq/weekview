import { UserIcon } from "lucide-react";
import { AccountManagerDialog } from "~/components/auth/account-manager-dialog";
import Logo from "~/components/brand/logo";
import { ThemeToggle } from "~/components/settings/theme-toggle";
import { Button } from "~/components/ui/button";

export const Header = () => (
	<header className="flex justify-between p-4">
		{/** Left side */}
		<h1 className="flex items-center">
			<Logo className="fill-foreground" />
		</h1>

		{/** Right side */}
		<div className="flex gap-2">
			<ThemeToggle />

			<AccountManagerDialog>
				<Button variant="outline">
					<UserIcon className="w-4 h-4" />
					Manage Account
				</Button>
			</AccountManagerDialog>
		</div>
	</header>
);
