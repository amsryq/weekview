import App from "./app";
import { Footer } from "./footer";
import { Header } from "./header";

export default function Page() {
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
