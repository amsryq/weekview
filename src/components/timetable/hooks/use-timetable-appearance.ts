import { useMemo } from "react";
import type { TimetableColorMode } from "~/lib/models/style";
import { resolveTimetableStyle } from "~/lib/utils/timetable-styles";

export function useTimetableAppearance(
	activeStyleId: string,
	timetableColorMode: TimetableColorMode,
	globalFontFamily: string,
	backgroundImage: string | null,
	backgroundImageOptions: { opacity: number },
) {
	const activeStyleMeta = resolveTimetableStyle(activeStyleId);
	const activeStyle = activeStyleMeta.variants[timetableColorMode];

	const backgroundStyle = useMemo(() => {
		const baseStyle = {
			backgroundColor: activeStyle.background.color,
			fontFamily: `'${globalFontFamily ?? activeStyleMeta.fontFamily}', sans-serif`,
		};

		if (backgroundImage) {
			return {
				...baseStyle,
				backgroundImage: `url(${backgroundImage})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				borderRadius: "8px",
			};
		}

		return baseStyle;
	}, [
		backgroundImage,
		activeStyle.background.color,
		globalFontFamily,
		activeStyleMeta.fontFamily,
	]);

	const overlayStyle = useMemo(
		() =>
			backgroundImage
				? { opacity: 1 - backgroundImageOptions.opacity }
				: undefined,
		[backgroundImage, backgroundImageOptions.opacity],
	);

	return { backgroundStyle, overlayStyle };
}
