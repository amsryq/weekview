import "~/globals.css";
import type { Metadata } from "next";
import { Toaster } from "~/components/ui/sonner";
import Providers from "./providers";

export const metadata: Metadata = {
	title: "Weekview",
	description:
		"Generate stunning weekly schedules effortlessly for your classes.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<body>
				<Providers>
					<div className="root">{children}</div>
				</Providers>
				<Toaster />
			</body>
		</html>
	);
}
