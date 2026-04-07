import { Clock, MapPin, Pencil, Trash2 } from "lucide-react";
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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
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
	 * Duration in hours, used for responsive layout in row mode.
	 */
	durationHours?: number;
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

type RowSizeTier = "normal" | "narrow" | "compact";

/** Thresholds in hours for row layout size tiers */
const COMPACT_THRESHOLD = 0.75;
const NARROW_THRESHOLD = 1.25;

function getRowSizeTier(durationHours: number | undefined): RowSizeTier {
	if (durationHours == null) return "normal";
	if (durationHours <= COMPACT_THRESHOLD) return "compact";
	if (durationHours <= NARROW_THRESHOLD) return "narrow";
	return "normal";
}

function FieldInfoRow({
	appearance,
	icon,
	text,
	fieldKey,
	layoutType,
	hideIcon,
	maxLines,
}: {
	appearance: RequiredDeep<CellAppearance>;
	icon?: React.ReactNode;
	text: React.ReactNode;
	fieldKey: keyof Required<typeof appearance.weight & {}>;
	layoutType: CourseBlockProps["layoutType"];
	hideIcon?: boolean;
	/** Max visible lines for the text. If set, clamps via line-clamp. */
	maxLines?: number;
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
					{!hideIcon && icon}
					<span
						className={
							maxLines != null
								? "overflow-hidden"
								: layoutType === "rows"
									? "truncate"
									: "text-wrap"
						}
						style={
							maxLines != null
								? {
										display: "-webkit-box",
										WebkitLineClamp: maxLines,
										WebkitBoxOrient: "vertical" as const,
										wordBreak: "break-all",
									}
								: undefined
						}
					>
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

/**
 * Compact vertical layout for very narrow blocks (e.g. ≤30min in row mode).
 * Renders code and location as vertical text, similar to a license plate.
 */
function CompactVerticalContent({
	course,
	meetingTime,
	appearance,
}: {
	course: Course;
	meetingTime: MeetingTime;
	appearance: RequiredDeep<CellAppearance>;
}) {
	return (
		<div
			className="h-full w-full flex flex-col items-center justify-center gap-0.5 overflow-hidden"
			style={{
				color: appearance.fgColor ?? "#ffffff",
				fontFamily: appearance.fontFamily
					? `'${appearance.fontFamily}', sans-serif`
					: undefined,
				writingMode: "vertical-rl",
				textOrientation: "mixed",
			}}
		>
			{/* Course code — fills available space */}
			{appearance.visibility.code && (
				<FitText
					fontSize={appearance.fontSize.code}
					className={`${FontWeightMap[appearance.weight.code]} leading-none`}
				>
					{course.code}
				</FitText>
			)}

			{/* Location — smaller, secondary */}
			{appearance.visibility.location && meetingTime.location && (
				<span
					className={`opacity-80 ${FontWeightMap[appearance.weight.location]} leading-none truncate`}
					style={{
						fontSize: Math.max(appearance.fontSize.location, 9),
					}}
				>
					{meetingTime.location}
				</span>
			)}
		</div>
	);
}

/**
 * Standard horizontal content for normal and narrow blocks.
 */
function StandardContent({
	course,
	meetingTime,
	appearance,
	layoutType,
	sizeTier,
}: {
	course: Course;
	meetingTime: MeetingTime;
	appearance: RequiredDeep<CellAppearance>;
	layoutType: CourseBlockProps["layoutType"];
	sizeTier: RowSizeTier;
}) {
	const isNarrow = sizeTier === "narrow";

	return (
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
			{appearance.icon && (
				<CustomIcon
					icon={appearance.icon}
					style={getIconPosition(appearance)}
				/>
			)}

			{/* Time */}
			<div>
				<FieldInfoRow
					fieldKey="time"
					appearance={appearance}
					layoutType={layoutType}
					hideIcon={isNarrow}
					icon={
						<Clock
							width={appearance.fontSize.time}
							height={appearance.fontSize.time}
						/>
					}
					text={`${meetingTime.time.toString()}`}
				/>
			</div>

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

			{/* Location — no icon in narrow mode, wrap up to 2 lines */}
			<FieldInfoRow
				fieldKey="location"
				layoutType={layoutType}
				appearance={appearance}
				hideIcon={isNarrow}
				maxLines={isNarrow ? 2 : undefined}
				icon={
					<MapPin
						width={appearance.fontSize.location}
						height={appearance.fontSize.location}
					/>
				}
				text={meetingTime.location}
			/>
		</div>
	);
}

function getIconPosition(
	appearance: RequiredDeep<CellAppearance>,
): React.CSSProperties | undefined {
	if (!appearance.icon) return undefined;

	const isRightAlign = appearance.textAlign === "right";
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
	};
}

export function CourseBlock({
	course,
	meetingTime,
	appearance,
	style,
	className = "relative overflow-hidden select-none cursor-pointer",
	layoutType,
	durationHours,
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

	const sizeTier =
		layoutType === "rows" ? getRowSizeTier(durationHours) : "normal";

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		openCourseEditor({
			course,
			onDelete: () => {
				CourseStore.getState().removeCourse(course.id);
			},
			onSubmit: (data) => {
				CourseStore.getState().updateCourse(course.id, data);
			},
		});
	};

	const handleDelete = () => {
		CourseStore.getState().removeCourse(course.id);
	};

	return (
		<HoverCard>
			<HoverCardTrigger>
				<Container
					material={appearance.material}
					glassOptions={appearance.glassOptions}
					blurOptions={appearance.blurOptions}
					className={className}
					style={containerStyle}
					onClick={handleClick}
				>
					{sizeTier === "compact" ? (
						<CompactVerticalContent
							course={course}
							meetingTime={meetingTime}
							appearance={appearance}
						/>
					) : (
						<StandardContent
							course={course}
							meetingTime={meetingTime}
							appearance={appearance}
							layoutType={layoutType}
							sizeTier={sizeTier}
						/>
					)}
				</Container>
			</HoverCardTrigger>
			<HoverCardContent className="w-auto p-2">
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={handleClick}
						aria-label={`Edit ${course.code}`}
						title="Edit"
					>
						<Pencil />
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								className="text-destructive hover:bg-destructive/10 hover:text-destructive"
								aria-label={`Delete ${course.code}`}
								title="Delete"
								onClick={(e) => e.stopPropagation()}
							>
								<Trash2 />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete {course.code}?</AlertDialogTitle>
								<AlertDialogDescription>
									This will permanently remove the course from the timetable.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									onClick={handleDelete}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
