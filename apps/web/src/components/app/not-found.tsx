import { Link } from "@tanstack/react-router";
import { Footer } from "~/components/app/footer";
import { Header } from "~/components/app/header";
import { Button } from "~/components/ui/button";

export function NotFound() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
				<h1 className="text-4xl font-bold">404</h1>
				<p className="text-xl text-muted-foreground">
					The page you are looking for does not exist.
				</p>
				<Button asChild>
					<Link to="/">Go Home</Link>
				</Button>
			</main>
			<Footer />
		</div>
	);
}
