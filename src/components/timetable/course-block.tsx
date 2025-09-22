import { Clock, MapPin } from "lucide-react";
import type React from "react";
import { RequiredDeep } from "type-fest";
import type { CellAppearance } from "~/lib/models/cell-appearance";
import { ColorEntry } from "~/lib/models/color-entry";
import type { Course } from "~/lib/models/course";
import type { MeetingTime } from "~/lib/models/meeting-time";
import { CustomIcon } from "../ui/custom-icon";
import { FitText } from "../ui/fit-text";
import GlassSurface from "../ui/glass-surface";

interface CourseBlockProps {
	course: Course;
	meetingTime: MeetingTime;
	appearance: RequiredDeep<CellAppearance>;
	/**
	 * Optional style override for the container
	 */
	style?: React.CSSProperties;
	/**
	 * Optional className override for the container
	 */
	className?: string;
	/**
	 * Optional layout type for conditional rendering
	 */
	layoutType?: "rows" | "columns";
}

const FontWeightMap = {
	light: "font-light",
	normal: "font-normal",
	medium: "font-medium",
	bold: "font-bold",
	semibold: "font-semibold",
} as const;

function FieldInfoRow({
	appearance,
	icon,
	text,
	fieldKey,
}: {
	appearance: RequiredDeep<CellAppearance>;
	icon?: React.ReactNode;
	text: React.ReactNode;
	fieldKey: keyof Required<typeof appearance.weight & {}>;
}) {
	const justifyClass =
		appearance.textAlign === "center"
			? "justify-center"
			: appearance.textAlign === "right"
				? "justify-end"
				: "justify-start";
	return (
		<div>
			{appearance.visibility[fieldKey] && text && (
				<div
					className={`truncate flex items-center gap-1 opacity-90 ${justifyClass} ${FontWeightMap[appearance.weight[fieldKey]]}`}
					style={{
						fontSize: appearance.fontSize[fieldKey],
						textAlign: appearance.textAlign,
						color: appearance.fgColor,
					}}
				>
					{icon}
					<span className="truncate">{text}</span>
				</div>
			)}
		</div>
	);
}

function Container({
	kind = "basic",
	children,
	style,
	className,
}: {
	kind?: "basic" | "glass";
	children: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
}) {
	if (kind === "glass") {
		return (
			<GlassSurface
				className={className}
				style={style}
				displace={2}
				backgroundOpacity={0.7}
			>
				{children}
			</GlassSurface>
		);
	}

	return (
		<div className={className} style={style}>
			{children}
		</div>
	);
}

export function CourseBlock({
	course,
	meetingTime,
	appearance,
	style,
	className = "relative overflow-hidden",
	layoutType,
}: CourseBlockProps) {
	const backgroundStyle = ColorEntry.getBackgroundStyle(appearance.background);

	const containerStyle: React.CSSProperties = {
		height: "100%",
		borderRadius: 12,
		backgroundColor: backgroundStyle.backgroundColor,
		...backgroundStyle,
		...style,
	};

	// Icon positioning logic
	const iconPosition = appearance.icon
		? (() => {
				const isRightAlign = appearance.textAlign === "right";

				// If text is right-aligned, place icon on top-left
				// If text is center or left-aligned, place icon on top-right
				const side = isRightAlign ? "left" : "right";

				return {
					position: "absolute",
					top: `${appearance.icon.offsetY}px`,
					[side]: `${appearance.icon.offsetX}px`,
					fontSize: `${appearance.icon.size * 10}px`,
					opacity: appearance.icon.opacity,
					transform: `rotate(${appearance.icon.rotation}deg)`,
					pointerEvents: "none",
					userSelect: "none",
					zIndex: 0,
				} as const;
			})()
		: null;

	return (
		<Container className={className} style={containerStyle}>
			<div
				className="h-full p-2 flex flex-col justify-between text-xs relative"
				style={{
					textAlign: appearance.textAlign,
					color: appearance.fgColor ?? "#ffffff",
				}}
			>
				{/* Icon */}
				{appearance.icon && iconPosition && (
					<CustomIcon icon={appearance.icon} style={iconPosition} />
				)}

				{/* Time */}
				<FieldInfoRow
					fieldKey="time"
					appearance={appearance}
					icon={
						<Clock
							width={appearance.fontSize.time}
							height={appearance.fontSize.time}
						/>
					}
					text={`${meetingTime.time.toString()}`}
				/>

				{/* Code + Course Name */}
				<div className="flex flex-col">
					{appearance.visibility.code && (
						<FitText
							fontSize={appearance.fontSize.code}
							className={`${FontWeightMap[appearance.weight.code]} leading-none`}
						>
							{course.code}
						</FitText>
					)}
					{appearance.visibility.name && course.name && (
						<div
							className={`opacity-90 ${FontWeightMap[appearance.weight.name]} ${
								layoutType === "rows" ? "truncate" : ""
							}`}
							style={{ fontSize: appearance.fontSize.name }}
						>
							{course.name}
						</div>
					)}
				</div>

				{/* Location */}
				<FieldInfoRow
					fieldKey="location"
					appearance={appearance}
					icon={
						<MapPin
							width={appearance.fontSize.location}
							height={appearance.fontSize.location}
						/>
					}
					text={meetingTime.location}
				/>
			</div>
		</Container>
	);
}
