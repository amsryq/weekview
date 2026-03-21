export const PREDEFINED_FONTS = [
	"Inter",
	"Roboto",
	"Open Sans",
	"Lato",
	"Montserrat",
	"Poppins",
	"Nunito",
	"Raleway",
	"Ubuntu",
	"Work Sans",
	"Rubik",
	"Merriweather",
	"Lora",
	"Playfair Display",
	"Source Sans 3",
	"DM Sans",
	"Fira Sans",
	"Manrope",
	"Quicksand",
	"Archivo",
] as const;

export type PredefinedFont = (typeof PREDEFINED_FONTS)[number];

export function buildGoogleFontsUrl(fonts: readonly string[]): string {
	const families = fonts.map(
		(font) => `${font.replaceAll(" ", "+")}:wght@300;400;500;600;700`,
	);
	return `https://fonts.googleapis.com/css2?${families
		.map((family) => `family=${family}`)
		.join("&")}&display=swap`;
}
