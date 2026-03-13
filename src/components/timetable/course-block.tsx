import { Clock, MapPin } from "lucide-react";
import type React from "react";
import { RequiredDeep } from "type-fest";
import { useCourseEditor } from "~/lib/contexts/course-editor";
import {
	type CellAppearance,
	type CellMaterial,
	DEFAULT_BLUR_OPTIONS,
	DEFAULT_GLASS_OPTIONS,
	type MaterialOptions,
} from "~/lib/models/cell-appearance";
import { ColorEntry } from "~/lib/models/color-entry";
import type { Course } from "~/lib/models/course";
import type { MeetingTime } from "~/lib/models/meeting-time";
import { CourseStore } from "~/lib/stores/course-store";
import { cn } from "~/lib/utils/styles";
import { CustomIcon } from "../ui/custom-icon";
import { FitText } from "../ui/fit-text";
import GlassSurface from "../ui/glass-surface";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "../ui/hover-card";

interface CourseBlockProps {
	course: Course;
	meetingTime: MeetingTime;
	appearance: RequiredDeep<CellAppearance>;
	layoutType: "rows" | "columns";
	/**
	 * Optional style override for the container
	 */
	style?: React.CSSProperties;
	/**
	 * Optional className override for the container
	 */
	className?: string;
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
	layoutType,
}: {
	appearance: RequiredDeep<CellAppearance>;
	icon?: React.ReactNode;
	text: React.ReactNode;
	fieldKey: keyof Required<typeof appearance.weight & {}>;
	layoutType: CourseBlockProps["layoutType"];
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
					className={`flex items-center gap-1 opacity-90 ${justifyClass} ${FontWeightMap[appearance.weight[fieldKey]]}`}
					style={{
						fontSize: appearance.fontSize[fieldKey],
						textAlign: appearance.textAlign,
						color: appearance.fgColor,
					}}
				>
					{icon}
					<span className={layoutType === "rows" ? "truncate" : "text-wrap"}>
						{text}
					</span>
				</div>
			)}
		</div>
	);
}

function Container({
	material = "basic",
	glassOptions,
	blurOptions,
	children,
	style,
	className,
	onClick,
}: {
	material?: CellMaterial;
	glassOptions?: MaterialOptions;
	blurOptions?: MaterialOptions;
	children: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
}) {
	if (material === "glass") {
		return (
			<GlassSurface
				className={className}
				style={style}
				displace={1}
				backgroundOpacity={
					glassOptions?.opacity ?? DEFAULT_GLASS_OPTIONS.opacity
				}
				blur={glassOptions?.blur ?? DEFAULT_GLASS_OPTIONS.blur}
			>
				<span onClick={onClick}>{children}</span>
			</GlassSurface>
		);
	}

	if (material === "blur") {
		const opacity = blurOptions?.opacity ?? DEFAULT_BLUR_OPTIONS.opacity;
		const blur = blurOptions?.blur ?? DEFAULT_BLUR_OPTIONS.blur;

		// We extract the background from style to apply it to an overlay with opacity.
		// This fixes blur for both solid colors and gradients.
		const { background, backgroundColor, ...restStyle } = style ?? {};

		return (
			<div
				className={cn(className, "backdrop-blur-md")}
				style={{
					...restStyle,
					backdropFilter: `blur(${blur}px)`,
					WebkitBackdropFilter: `blur(${blur}px)`,
				}}
				onClick={onClick}
			>
				{/* Background Overlay */}
				<div
					className="absolute inset-0 z-0 pointer-events-none rounded-[inherit]"
					style={{
						background: background as string,
						backgroundColor: backgroundColor as string,
						opacity,
					}}
				/>
				{/* Content */}
				<div className="relative z-10 h-full">{children}</div>
			</div>
		);
	}

	return (
		<div className={className} style={style} onClick={onClick}>
			{children}
		</div>
	);
}

export function CourseBlock({
	course,
	meetingTime,
	appearance,
	style,
	className = "relative overflow-hidden select-none cursor-pointer",
	layoutType,
}: CourseBlockProps) {
	const { openCourseEditor } = useCourseEditor();
	const backgroundStyle = ColorEntry.getBackgroundStyle(appearance.background);

	const containerStyle: React.CSSProperties = {
		height: "100%",
		margin: 1,
		borderRadius: appearance.borderRadius ?? 8,
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
		<HoverCard>
			<HoverCardTrigger>
				<Container
					material={appearance.material}
					glassOptions={appearance.glassOptions}
					blurOptions={appearance.blurOptions}
					className={className}
					style={containerStyle}
					onClick={(e) => {
						e.stopPropagation();
						openCourseEditor({
							course,
							onSubmit: (data) => {
								CourseStore.getState().updateCourse(course.id, data);
							},
						});
					}}
				>
					<div
						className="h-full p-2 flex flex-col justify-between text-xs relative"
						style={{
							textAlign: appearance.textAlign,
							color: appearance.fgColor ?? "#ffffff",
							fontFamily: appearance.fontFamily
								? `'${appearance.fontFamily}', sans-serif`
								: undefined,
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
							layoutType={layoutType}
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
									fontSize={
										appearance.autoSizeFont !== false &&
										(!appearance.visibility.name || !course.name)
											? appearance.fontSize.code * 1.5
											: appearance.fontSize.code
									}
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
							layoutType={layoutType}
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
			</HoverCardTrigger>
			<HoverCardContent>
				<div className="space-y-2">
					<h4 className="text-sm font-semibold">{course.code}</h4>
					<p className="text-sm text-muted-foreground">{course.name}</p>
					<div className="flex items-center gap-2 text-sm">
						<Clock className="w-4 h-4" />
						{meetingTime.time.toString()}
					</div>
					{meetingTime.location && (
						<div className="flex items-center gap-2 text-sm">
							<MapPin className="w-4 h-4" />
							{meetingTime.location}
						</div>
					)}
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
