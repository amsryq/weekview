import { createFileRoute } from "@tanstack/react-router";
import App from "~/components/app/app";
import { Footer } from "~/components/app/footer";
import { Header } from "~/components/app/header";
import { seo } from "~/lib/utils/seo";

export const Route = createFileRoute("/app")({
	head: () => ({ meta: seo() }),
	component: AppPage,
});

function AppPage() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex flex-1 flex-col">
				<App />
			</main>
			<Footer />
		</div>
	);
}
