import "~/globals.css";

import App from "./app";
import { Header } from "./header";

export default function Page() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex flex-1 flex-col">
				<App />
			</main>
			<footer className="flex flex-col items-center p-4">
				<p className="font-mono">© {new Date().getFullYear()} amsyarasyiq</p>
			</footer>
		</div>
	);
}
