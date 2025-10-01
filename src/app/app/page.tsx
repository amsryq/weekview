import type { Metadata } from "next";
import App from "./app";
import { Footer } from "./footer";
import { Header } from "./header";

export const metadata: Metadata = {
	title: "Weekview",
	icons: {
		icon: "/images/icon.png",
	},
	description:
		"Create beautiful, customizable weekly timetables for your classes with Weekview. Free online timetable generator. Perfect for students.",
	keywords: [
		"timetable",
		"schedule",
		"weekly planner",
		"class schedule",
		"timetable generator",
		"weekly calendar",
		"student planner",
		"course schedule",
		"academic calendar",
		"PNG export",
		"customizable timetable",
	],
	authors: [{ name: "amsyarasyiq" }],
	creator: "amsyarasyiq",
	publisher: "amsyarasyiq",
	openGraph: {
		title: "Weekview - Generate Weekly Schedules",
		description:
			"Create beautiful, customizable weekly timetables for your classes. Free online timetable generator with themes, colors, and PNG export.",
		url: "https://weekview.my",
		siteName: "Weekview",
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Weekview - Generate Stunning Weekly Schedules",
		description:
			"Create beautiful, customizable weekly timetables for your classes. Free online timetable generator with themes, colors, and PNG export.",
		creator: "@amsyarasyiq",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	alternates: {
		canonical: "https://weekview.my",
	},
	other: {
		"application/ld+json": JSON.stringify({
			"@context": "https://schema.org",
			"@type": "WebApplication",
			name: "Weekview",
			description:
				"Create beautiful, customizable weekly timetables for your classes. Free online timetable generator with themes, colors, and PNG export.",
			url: "https://weekview.my",
			applicationCategory: "ProductivityApplication",
			operatingSystem: "Web Browser",
			author: {
				"@type": "Person",
				name: "amsyarasyiq",
				url: "https://github.com/amsyarasyiq",
			},
			publisher: {
				"@type": "Person",
				name: "amsyarasyiq",
			},
			datePublished: `${new Date().toISOString().split("T")[0]}`,
		}),
	},
};

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
