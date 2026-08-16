import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils/styles";

interface FitTextProps {
	children: React.ReactNode;
	fontSize: number;
	className?: string;
	style?: React.CSSProperties;
	minFontSize?: number;
}

/**
 * A component that automatically adjusts the font size of its children
 * to fit within the width of its container, down to a specified minimum font size.
 *
 * The component observes its own size, and reduces the font size
 * if the text overflows, ensuring the text remains on a single line with ellipsis if needed.
 *
 * @param children - The text or elements to display inside the component.
 * @param fontSize - The initial font size (in pixels) to attempt to use.
 * @param className - Optional additional class names to apply to the container.
 * @param style - Optional additional inline styles to apply to the container.
 * @param minFontSize - The minimum font size (in pixels) allowed. Defaults to 16.
 *
 * @example
 * ```tsx
 * <FitText fontSize={32} minFontSize={12}>
 *   This text will shrink to fit its container.
 * </FitText>
 * ```
 */
export function FitText({
	children,
	fontSize,
	className,
	style = {},
	minFontSize = 16,
}: FitTextProps) {
	const textElementRef = useRef<HTMLDivElement>(null);
	const [currentFontSize, setCurrentFontSize] = useState(fontSize);

	// oxlint-disable-next-line react/exhaustive-deps
	useLayoutEffect(() => {
		const adjustFontSize = () => {
			if (!textElementRef.current) return;

			let testFontSize = fontSize;
			textElementRef.current.style.fontSize = `${testFontSize}px`;

			// Check if text overflows and reduce font size if needed
			// We use a small buffer to avoid subpixel rounding issues
			const element = textElementRef.current;
			if (!element) return;

			while (testFontSize > minFontSize) {
				// Safety check: if container has no width yet, we can't measure overflow accurately
				if (element.clientWidth === 0) break;

				const isOverflowing = element.scrollWidth > element.clientWidth + 1;

				if (!isOverflowing) break;

				testFontSize -= 0.5;
				element.style.fontSize = `${testFontSize}px`;
			}

			setCurrentFontSize(testFontSize);
		};

		const observer = new ResizeObserver(() => {
			adjustFontSize();
		});

		const element = textElementRef.current;
		if (element) {
			observer.observe(element);
		}

		// Initial adjustment
		adjustFontSize();

		return () => {
			observer.disconnect();
		};
	}, [children, fontSize, minFontSize]);

	return (
		<div
			ref={textElementRef}
			className={cn(className)}
			style={{
				...style,
				fontSize: `${currentFontSize}px`,
				whiteSpace: "nowrap",
				overflow: "hidden",
			}}
		>
			{children}
		</div>
	);
}
