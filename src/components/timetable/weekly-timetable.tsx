import { PlusIcon } from "lucide-react";
import { createContext, memo, useContext, useMemo } from "react";
import { RequiredDeep } from "type-fest";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { UiTMAddCourseButton } from "~/features/uitm/provider";
import { useImporterDialogs } from "~/lib/contexts/importer-dialogs";
import type { CellAppearance } from "~/lib/models/cell-appearance";
import type { Course } from "~/lib/models/course";
import type { MeetingTime } from "~/lib/models/meeting-time";
import { CustomStylesStore } from "~/lib/stores/custom-styles-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { resolveTimetableStyleVariant } from "~/lib/utils/timetable-styles";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import {
	COLUMN_BLOCK_HEIGHT_PX,
	DAY_TO_INDEX,
	ROW_BLOCK_WIDTH_PX,
} from "./constants";
import { CourseBlock } from "./course-block";
import { useTimetableAppearance } from "./hooks/use-timetable-appearance";
import { useTimetableData } from "./hooks/use-timetable-data";
import { useTimetableLayout } from "./hooks/use-timetable-layout";
import { useTimetablePreferences } from "./hooks/use-timetable-preferences";

interface TimetableContextProps {
	courses: Course[];
	timeSlots: string[];
	rowWidth: number;
	columnHeight: number;
	layout: "rows" | "columns";
	backgroundStyle?: React.CSSProperties;
	overlayStyle?: React.CSSProperties;
}

const TimetableContext = createContext<TimetableContextProps | null>(null);

function useTimetable() {
	const ctx = useContext(TimetableContext);
	if (!ctx)
		throw new Error("useTimetable must be used within TimetableProvider");
	return ctx;
}

interface PositionedCourseBlockProps {
	course: Course;
	meetingTime: MeetingTime;
	appearance: RequiredDeep<CellAppearance>;
	layout: "rows" | "columns";
	timeSlots: string[];
}

const PositionedCourseBlock = memo(function PositionedCourseBlock({
	course,
	meetingTime,
	appearance,
	layout,
	timeSlots,
}: PositionedCourseBlockProps) {
	const {
		start: { hour: startHour, minute: startMinute },
		end: { hour: endHour, minute: endMinute },
	} = meetingTime.time;

	const startOffsetHours = startHour + startMinute / 60;
	const endOffsetHours = endHour + endMinute / 60;
	const durationHours = endOffsetHours - startOffsetHours;
	const earliestHour = Number.parseInt(timeSlots[0].split(":")[0]);

	const positionStyle = useMemo<React.CSSProperties>(() => {
		if (layout === "rows") {
			return {
				position: "absolute",
				left: `${(startOffsetHours - earliestHour) * ROW_BLOCK_WIDTH_PX}px`,
				width: `${durationHours * ROW_BLOCK_WIDTH_PX}px`,
				top: "2px",
				bottom: "0px",
			};
		}
		return {
			position: "absolute",
			top: `${(startOffsetHours - earliestHour) * COLUMN_BLOCK_HEIGHT_PX}px`,
			height: `${durationHours * COLUMN_BLOCK_HEIGHT_PX}px`,
			left: "2px",
			right: "0px",
		};
	}, [layout, startOffsetHours, earliestHour, durationHours]);

	return (
		<div style={positionStyle}>
			<CourseBlock
				course={course}
				meetingTime={meetingTime}
				appearance={appearance}
				layoutType={layout}
			/>
		</div>
	);
});

function DayColumn({ day, dayIndex }: { day: string; dayIndex: number }) {
	const { courses, timeSlots, columnHeight, rowWidth, layout } = useTimetable();
	const prefs = useStore(TimetablePreferencesStore);
	useStore(CustomStylesStore);
	const { activeStyleId, timetableColorMode } = useStore(
		TimetablePreferencesStore,
		useShallow((s) => ({
			activeStyleId: s.activeStyleId,
			timetableColorMode: s.timetableColorMode,
		})),
	);
	const activeStyle = resolveTimetableStyleVariant(
		activeStyleId,
		timetableColorMode,
	);
	const meetingDay = dayIndex + 1;

	const dayMeetings = courses.flatMap((course) =>
		course.meetingTimes
			.filter((mt) => mt.day === meetingDay)
			.map((mt) => ({ course, meetingTime: mt })),
	);

	const containerStyle =
		layout === "rows"
			? { width: `${rowWidth}px`, height: "96px" }
			: { height: `${columnHeight}px`, width: "120px" };

	const lineClass =
		layout === "rows"
			? "absolute top-0 bottom-0 border-l"
			: "absolute left-0 right-0 border-t";

	const lineStyle = (index: number) =>
		layout === "rows"
			? { left: `${index * ROW_BLOCK_WIDTH_PX}px` }
			: { top: `${index * COLUMN_BLOCK_HEIGHT_PX}px` };

	return (
		<div className={layout === "rows" ? "flex" : ""}>
			<div
				className={
					layout === "rows"
						? "w-16 shrink-0 flex items-center justify-end pr-6"
						: "h-8 flex items-center justify-center"
				}
			>
				<div
					className="text-sm font-medium"
					style={{ color: activeStyle.chrome.labelColor }}
				>
					{day}
				</div>
			</div>

			<div className="relative" style={containerStyle}>
				{timeSlots.map((_, index) => (
					<div
						key={index}
						className={lineClass}
						style={{
							...lineStyle(index),
							borderColor: activeStyle.chrome.gridLineColor,
						}}
					/>
				))}

				{dayMeetings.map(({ course, meetingTime }, idx) => (
					<PositionedCourseBlock
						key={`${course.code}-${meetingTime.day}-${idx}`}
						course={course}
						meetingTime={meetingTime}
						appearance={prefs.getCellAppearance(course, meetingTime)}
						layout={layout}
						timeSlots={timeSlots}
					/>
				))}
			</div>
		</div>
	);
}

function RowLayout({
	visibleDays,
	containerId,
}: {
	visibleDays: string[];
	containerId: string;
}) {
	const { timeSlots, backgroundStyle, overlayStyle } = useTimetable();
	const { activeStyleId, timetableColorMode } = useStore(
		TimetablePreferencesStore,
		useShallow((s) => ({
			activeStyleId: s.activeStyleId,
			timetableColorMode: s.timetableColorMode,
		})),
	);
	const activeStyle = resolveTimetableStyleVariant(
		activeStyleId,
		timetableColorMode,
	);

	return (
		<div className="overflow-x-auto">
			<div
				id={containerId}
				className="bg-card p-6 min-w-fit relative"
				style={backgroundStyle}
			>
				{overlayStyle && (
					<div
						className="absolute inset-0 bg-background"
						style={overlayStyle}
					/>
				)}
				<div className="relative z-10">
					<div className="flex pb-2">
						<div className="w-16 shrink-0" />
						<div className="flex">
							{timeSlots.map((time: string) => (
								<div
									key={time}
									className="text-sm text-center -translate-x-4 flex shrink-0"
									style={{
										width: `${ROW_BLOCK_WIDTH_PX}px`,
										color: activeStyle.chrome.timeColor,
									}}
								>
									<span className="font-semibold">{time}</span>
								</div>
							))}
						</div>
					</div>

					{visibleDays.map((day: string) => (
						<DayColumn
							key={day}
							day={day}
							dayIndex={DAY_TO_INDEX.get(day) ?? 0}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function ColumnLayout({
	visibleDays,
	containerId,
}: {
	visibleDays: string[];
	containerId: string;
}) {
	const { timeSlots, backgroundStyle, overlayStyle } = useTimetable();
	const { activeStyleId, timetableColorMode } = useStore(
		TimetablePreferencesStore,
		useShallow((s) => ({
			activeStyleId: s.activeStyleId,
			timetableColorMode: s.timetableColorMode,
		})),
	);
	const activeStyle = resolveTimetableStyleVariant(
		activeStyleId,
		timetableColorMode,
	);
	return (
		<div className="overflow-y-auto">
			<div
				id={containerId}
				className="bg-card grid relative p-6"
				style={{
					gridTemplateColumns: `auto repeat(${visibleDays.length}, 1fr)`,
					...backgroundStyle,
				}}
			>
				{overlayStyle && (
					<div
						className="absolute inset-0 bg-background rounded-lg"
						style={overlayStyle}
					/>
				)}
				<div className="relative z-10 contents">
					<div className="space-y-0">
						<div className="h-8" />
						{timeSlots.map((time: string) => (
							<span
								key={time}
								style={{
									height: `${COLUMN_BLOCK_HEIGHT_PX}px`,
									color: activeStyle.chrome.timeColor,
								}}
								className="flex text-[12px] font-semibold pr-2 -translate-y-2 justify-end"
							>
								{time}
							</span>
						))}
					</div>

					{visibleDays.map((day: string) => (
						<DayColumn
							key={day}
							day={day}
							dayIndex={DAY_TO_INDEX.get(day) ?? 0}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function TimetableSkeleton() {
	return (
		<Card className="py-0 overflow-hidden">
			<CardContent className="max-w-[95vw] px-0">
				<div className="overflow-x-auto">
					<div className="bg-card p-6 min-w-fit">
						<div className="flex pb-2">
							<div className="w-16 shrink-0" />
							<div className="flex">
								{Array.from({ length: 11 }).map((_, i) => (
									<div
										key={i}
										className="flex shrink-0 -translate-x-4"
										style={{ width: `${ROW_BLOCK_WIDTH_PX}px` }}
									>
										<div className="h-4 w-8 bg-muted rounded mx-auto animate-pulse" />
									</div>
								))}
							</div>
						</div>
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex">
								<div className="w-16 shrink-0 flex items-center justify-end pr-6 h-[96px]">
									<div className="h-4 w-8 bg-muted rounded animate-pulse" />
								</div>
								<div
									className="relative h-[96px]"
									style={{ width: `${11 * ROW_BLOCK_WIDTH_PX}px` }}
								>
									{Array.from({ length: 11 }).map((_, j) => (
										<div
											key={j}
											className="absolute top-0 bottom-0 border-l border-muted"
											style={{ left: `${j * ROW_BLOCK_WIDTH_PX}px` }}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

interface WeeklyTimetableProps {
	layout?: "rows" | "columns";
	/**
	 * This will be pulled from CourseStore if not provided
	 */
	courses?: Course[];
	containerId?: string;
}

export function WeeklyTimetable({
	layout,
	courses: coursesProp,
	containerId = "weekly-timetable",
}: WeeklyTimetableProps) {
	const { mounted, courses } = useTimetableData(coursesProp);
	const {
		prefsLayout,
		backgroundImage,
		activeStyleId,
		timetableColorMode,
		globalFontFamily,
		backgroundImageOptions,
	} = useTimetablePreferences();
	const { effectiveLayout, visibleDays, timeSlots, columnHeight, rowWidth } =
		useTimetableLayout(courses, layout, prefsLayout);
	const { backgroundStyle, overlayStyle } = useTimetableAppearance(
		activeStyleId,
		timetableColorMode,
		globalFontFamily,
		backgroundImage,
		backgroundImageOptions,
	);
	const isEmpty = courses.length === 0;

	const { openManualImporter } = useImporterDialogs();

	if (!mounted) {
		return <TimetableSkeleton />;
	}

	return (
		<Card className="py-0 overflow-hidden">
			<CardContent className="max-w-[95vw] px-0">
				<div className="relative">
					<TimetableContext.Provider
						value={{
							courses,
							timeSlots,
							columnHeight,
							rowWidth,
							layout: effectiveLayout,
							backgroundStyle,
							overlayStyle,
						}}
					>
						<div
							className={
								isEmpty
									? "opacity-20 grayscale pointer-events-none select-none"
									: ""
							}
						>
							{effectiveLayout === "rows" ? (
								<RowLayout
									visibleDays={visibleDays}
									containerId={containerId}
								/>
							) : (
								<ColumnLayout
									visibleDays={visibleDays}
									containerId={containerId}
								/>
							)}
						</div>
					</TimetableContext.Provider>

					{isEmpty && (
						<div className="absolute inset-0 z-20 flex items-center justify-center p-4">
							<Card className="max-w-[280px] w-full shadow-2xl border bg-card/80 backdrop-blur-xl border-primary/10 p-0 overflow-hidden">
								<CardHeader className="text-center p-6 pb-0">
									<div className="flex flex-col gap-2">
										<CardTitle className="text-lg font-medium tracking-tight">
											It's empty in here...
										</CardTitle>
										<CardDescription className="text-xs font-normal leading-relaxed">
											Get started by importing your courses or adding them
											manually:
										</CardDescription>
									</div>
								</CardHeader>
								<CardContent className="p-6 pt-0 flex flex-col gap-2">
									<UiTMAddCourseButton className="w-full h-10 text-sm" />
									<Button
										size="sm"
										className="w-full text-sm"
										onClick={openManualImporter}
									>
										<PlusIcon className="w-4 h-4" />
										Add Manually
									</Button>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
