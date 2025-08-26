"use client";

import type { IconAppearance } from "~/lib/models/cell-appearance";
import { Twemoji } from "./twemoji";

interface CustomIconProps {
	icon: IconAppearance;
	style?: React.CSSProperties;
	className?: string;
}

export function CustomIcon({ icon, style, className }: CustomIconProps) {
	if (!icon) {
		return null;
	}

	const hasEmoji =
		icon.type === "emoji" && icon.emoji && icon.emoji.trim() !== "";
	const hasSvg = icon.type === "svg" && icon.svg && icon.svg.trim() !== "";

	if (!hasEmoji && !hasSvg) {
		return null;
	}

	if (hasEmoji) {
		return <Twemoji emoji={icon.emoji!} style={style} className={className} />;
	}

	if (hasSvg) {
		return (
			<div style={style} className={`custom-icon ${className || ""}`}>
				<img src={`data:image/svg+xml;utf8,${encodeURIComponent(icon.svg!)}`} />
			</div>
		);
	}

	return null;
}
