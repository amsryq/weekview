import "~/globals.css";
import { UserIcon } from "lucide-react";
import { AccountManagerDialog } from "~/components/account-manager-dialog";
import { Button } from "~/components/ui/button";
import App from "./app";

export default function Page() {
	return (
		<div className="flex flex-col min-h-screen">
			<header className="flex justify-between p-4">
				<h1>Weekview</h1>
				<AccountManagerDialog>
					<Button variant="outline">
						<UserIcon className="w-4 h-4" />
						Manage Account
					</Button>
				</AccountManagerDialog>
			</header>
			<main className="flex flex-1 flex-col">
				<App />
			</main>
			<footer className="flex p-4">
				<p>© 2025 amsyarasyiq</p>
			</footer>
		</div>
	);
}
