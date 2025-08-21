import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Taiki",
	description: "A weekly timetable generator",
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
