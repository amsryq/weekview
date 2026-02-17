import { createFileRoute } from "@tanstack/react-router";
import App from "~/app/app/app";
import { Footer } from "~/app/app/footer";
import { Header } from "~/app/app/header";

const APP_DESCRIPTION =
  "Create beautiful, customizable weekly timetables for your classes with Weekview. Free online timetable generator. Perfect for students.";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Weekview" },
      { name: "description", content: APP_DESCRIPTION },
      {
        name: "keywords",
        content:
          "timetable, uitm, uitm timetable, uitm icress, schedule, weekly planner, class schedule, timetable generator, weekly calendar, student planner, course schedule, academic calendar, PNG export, customizable timetable",
      },
      { name: "author", content: "amsryq" },
      {
        property: "og:title",
        content: "Weekview - Generate Weekly Schedules",
      },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:url", content: "https://weekview.my" },
      { property: "og:site_name", content: "Weekview" },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Weekview - Generate Stunning Weekly Schedules",
      },
      { name: "twitter:description", content: APP_DESCRIPTION },
      { name: "twitter:creator", content: "@amsryq" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/images/favicon-96x96.png",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/images/favicon.svg",
      },
      { rel: "shortcut icon", href: "/images/favicon.ico" },
      {
        rel: "apple-touch-icon",
        href: "/images/apple-touch-icon.png",
      },
      { rel: "manifest", href: "/images/site.webmanifest" },
      { rel: "canonical", href: "https://weekview.my" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Weekview",
          description: APP_DESCRIPTION,
          url: "https://weekview.my",
          applicationCategory: "ProductivityApplication",
          operatingSystem: "Web Browser",
          author: {
            "@type": "Person",
            name: "amsryq",
            url: "https://github.com/amsryq",
          },
          publisher: {
            "@type": "Person",
            name: "amsryq",
          },
          datePublished: `${new Date().toISOString().split("T")[0]}`,
        }),
      },
    ],
  }),
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
