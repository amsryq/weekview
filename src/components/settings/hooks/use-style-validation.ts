import { useCallback } from "react";
import { HEX_COLOR_REGEX, normalizeHexColor } from "../utils/style-utils";

export const useStyleValidation = () => {
	const isValidHex = useCallback(
		(color: string) => HEX_COLOR_REGEX.test(color.trim()),
		[],
	);
	const normalize = useCallback(normalizeHexColor, []);
	return { isValidHex, normalize };
};
