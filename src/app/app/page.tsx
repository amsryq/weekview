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
			<footer className="flex font-mono justify-center gap-4 p-4 text-sm">
				<p>© {process.env.COPYRIGHT_YEAR} amsyarasyiq</p>
				<span className="hidden md:inline">|</span>
				<nav className="flex gap-4">
					<Link href="/privacy" className="underline">
						Privacy Policy
					</Link>
					<span className="hidden md:inline">-</span>
					<Link href="/terms" className="underline">
						Terms of Service
					</Link>
				</nav>
			</footer>
		</div>
	);
}
