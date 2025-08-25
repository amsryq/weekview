import "~/globals.css";
import { Main } from "./client";

export default function Page() {
	return (
		<div className="flex flex-col min-h-screen">
			<header className="flex justify-between p-4">
				<h1>Weekview</h1>
				Placeholder here...
			</header>
			<main className="flex flex-1 flex-col">
				<Main />
			</main>
			<footer className="flex p-4">
				<p>© 2025 amsyarasyiq</p>
			</footer>
		</div>
	);
}
