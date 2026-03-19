export const DEFAULT_SEO = {
	title: "Weekview",
	description:
		"Build, customize, and export your university class schedules intuitively. Weekview is the top free timetable generator for students, featuring smart conflict detection and beautiful PNG exports.",
	keywords:
		"university timetable generator, college class schedule maker, weekly planner, student planner, course scheduler, timetable generator, UiTM, uitm timetable generator",
	image: "https://weekview.my/images/web-app-manifest-512x512.png",
};

export const seo = ({
	title = DEFAULT_SEO.title,
	description = DEFAULT_SEO.description,
	image = DEFAULT_SEO.image,
	keywords = DEFAULT_SEO.keywords,
}: Partial<typeof DEFAULT_SEO> = {}) => {
	const tags = [
		{ title },
		{ name: "description", content: description },
		{ name: "keywords", content: keywords },
		{ name: "author", content: "amsryq" },
		{ name: "robots", content: "index, follow" },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:url", content: "https://weekview.my" },
		{ property: "og:site_name", content: "Weekview" },
		{ property: "og:locale", content: "en_US" },
		{ property: "og:type", content: "website" },
		{ property: "og:image", content: image },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:creator", content: "@amsryq" },
		{ name: "twitter:image", content: image },
	];

	return tags;
};
