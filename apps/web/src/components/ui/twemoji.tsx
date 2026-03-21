import { useEffect, useRef } from "react";
import twemoji from "twemoji";
import { cn } from "~/lib/utils/styles";

interface TwemojiProps {
	emoji: string;
	className?: string;
	style?: React.CSSProperties;
}

export function Twemoji({ emoji, className, style }: TwemojiProps) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (ref.current && emoji) {
			// Clear existing content
			ref.current.innerHTML = emoji;

			// Parse with twemoji
			twemoji.parse(ref.current, {
				folder: "svg",
				ext: ".svg",
				base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
				className: "twemoji",
			});
		}
	}, [emoji]);

	return (
		<span ref={ref} className={cn("leading-0", className)} style={style} />
	);
}
