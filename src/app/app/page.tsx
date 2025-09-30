import Link from "next/link";
import App from "./app";
import { Header } from "./header";

export default function Page() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex flex-1 flex-col">
				<App />
			</main>
			<footer className="flex flex-col items-center gap-2 p-4 text-sm">
				<p className="font-mono">© {process.env.COPYRIGHT_YEAR} amsyarasyiq</p>
				<nav className="flex gap-4">
					<Link href="/privacy" className="underline">
						Privacy Policy
					</Link>
					<Link href="/terms" className="underline">
						Terms of Service
					</Link>
				</nav>
			</footer>
		</div>
	);
}
