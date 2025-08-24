import type { Metadata } from "next";
import { ThemeProvider } from "../lib/hooks/use-theme";

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
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider defaultTheme="system" storageKey="weekview-ui-theme">
					<div className="root">{children}</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
