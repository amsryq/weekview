import type { Metadata } from "next";

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
				<div className="root">{children}</div>
			</body>
		</html>
	);
}
