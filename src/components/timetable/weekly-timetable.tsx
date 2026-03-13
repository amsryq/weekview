import { PlusIcon } from "lucide-react";
import { createContext, useContext, useMemo } from "react";
import { RequiredDeep } from "type-fest";
import { useStore } from "zustand";
import { UiTMAddCourseButton } from "~/features/uitm/provider";
import { useImporterDialogs } from "~/lib/contexts/importer-dialogs";
import { useMounted } from "~/lib/hooks/useMounted";
import type { CellAppearance } from "~/lib/models/cell-appearance";
import type { Course } from "~/lib/models/course";
import type { MeetingTime } from "~/lib/models/meeting-time";
import { CourseStore } from "~/lib/stores/course-store";
import { CustomStylesStore } from "~/lib/stores/custom-styles-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import {
	resolveTimetableStyle,
	resolveTimetableStyleVariant,
} from "~/lib/utils/timetable-styles";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { CourseBlock } from "./course-block";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROW_BLOCK_WIDTH_PX = 84;
const COLUMN_BLOCK_HEIGHT_PX = 84;

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

function PositionedCourseBlock({
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

	const positionStyle: React.CSSProperties = (() => {
		if (layout === "rows") {
			return {
				position: "absolute",
				left: `${(startOffsetHours - earliestHour) * ROW_BLOCK_WIDTH_PX}px`,
				width: `${durationHours * ROW_BLOCK_WIDTH_PX}px`,
				top: "2px",
				bottom: "0px",
			};
		} else {
			return {
				position: "absolute",
				top: `${(startOffsetHours - earliestHour) * COLUMN_BLOCK_HEIGHT_PX}px`,
				height: `${durationHours * COLUMN_BLOCK_HEIGHT_PX}px`,
				left: "2px",
				right: "0px",
			};
		}
	})();

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
}

function DayColumn({ day, dayIndex }: { day: string; dayIndex: number }) {
	const { courses, timeSlots, columnHeight, rowWidth, layout } = useTimetable();
	const prefs = useStore(TimetablePreferencesStore);
	useStore(CustomStylesStore);
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(s) => s.activeStyleId,
	);
	const timetableColorMode = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableColorMode,
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
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(s) => s.activeStyleId,
	);
	const timetableColorMode = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableColorMode,
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
						<DayColumn key={day} day={day} dayIndex={DAYS.indexOf(day)} />
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
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(s) => s.activeStyleId,
	);
	const timetableColorMode = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableColorMode,
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
						<DayColumn key={day} day={day} dayIndex={DAYS.indexOf(day)} />
					))}
				</div>
			</div>
		</div>
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
	courses: _courses,
	containerId = "weekly-timetable",
}: WeeklyTimetableProps) {
	const mounted = useMounted();
	const courses = useStore(CourseStore, (state) => _courses || state.courses);
	useStore(CustomStylesStore);
	const prefsLayout = useStore(TimetablePreferencesStore, (s) => s.layout);
	const backgroundImage = useStore(
		TimetablePreferencesStore,
		(s) => s.backgroundImage,
	);
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(s) => s.activeStyleId,
	);
	const timetableColorMode = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableColorMode,
	);
	const globalFontFamily = useStore(
		TimetablePreferencesStore,
		(s) => s.cellAppearance.fontFamily,
	);
	const backgroundImageOptions = useStore(
		TimetablePreferencesStore,
		(s) => s.backgroundImageOptions,
	);
	const activeStyleMeta = resolveTimetableStyle(activeStyleId);
	const activeStyle = activeStyleMeta.variants[timetableColorMode];
	// Allow prop override; default to preferences
	const effectiveLayout = layout ?? prefsLayout;

	const visibleDays = useMemo(() => {
		const maxDay = Math.max(
			5,
			...courses.flatMap((c) => c.meetingTimes.map((mt) => mt.day)),
		);
		return DAYS.slice(0, maxDay);
	}, [courses]);

	const { timeSlots, columnHeight, rowWidth } = useMemo(() => {
		if (courses.length === 0) {
			const slots: string[] = [];
			for (let hour = 8; hour <= 18; hour++) {
				slots.push(`${hour.toString().padStart(2, "0")}:00`);
			}
			return {
				timeSlots: slots,
				columnHeight: slots.length * COLUMN_BLOCK_HEIGHT_PX,
				rowWidth: slots.length * ROW_BLOCK_WIDTH_PX,
			};
		}

		let earliestHour = 24;
		let latestHour = 0;

		courses.forEach((course) => {
			course.meetingTimes.forEach((mt) => {
				earliestHour = Math.min(earliestHour, mt.time.start.hour);
				latestHour = Math.max(latestHour, mt.time.end.hour);
			});
		});

		earliestHour = Math.min(8, Math.max(6, earliestHour));
		latestHour = Math.max(Math.min(23, latestHour - 1), 18);

		const slots: string[] = [];
		for (let hour = earliestHour; hour <= latestHour; hour++) {
			slots.push(`${hour.toString().padStart(2, "0")}:00`);
		}

		return {
			timeSlots: slots,
			columnHeight: slots.length * COLUMN_BLOCK_HEIGHT_PX,
			rowWidth: slots.length * ROW_BLOCK_WIDTH_PX,
		};
	}, [courses]);

	const backgroundStyle = backgroundImage
		? {
				backgroundImage: `url(${backgroundImage})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				backgroundColor: activeStyle.background.color,
				fontFamily: `'${globalFontFamily ?? activeStyleMeta.fontFamily}', sans-serif`,
				borderRadius: "8px",
			}
		: {
				backgroundColor: activeStyle.background.color,
				fontFamily: `'${globalFontFamily ?? activeStyleMeta.fontFamily}', sans-serif`,
			};

	const overlayStyle = backgroundImage
		? { opacity: 1 - backgroundImageOptions.opacity }
		: undefined;

	const isEmpty = courses.length === 0;
	const { openManualImporter } = useImporterDialogs();

	return (
		<Card
			className="py-0 overflow-hidden"
			style={{
				visibility: mounted ? "visible" : "hidden",
			}}
		>
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
								isEmpty ? "blur-sm pointer-events-none select-none" : ""
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
						<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
							<p className="text-sm font-medium text-muted-foreground">
								Your timetable is empty. Let's get started:
							</p>
							<div className="flex flex-wrap items-center justify-center gap-2">
								<Button onClick={openManualImporter}>
									<PlusIcon className="w-4 h-4" />
									Add Course
								</Button>
								<UiTMAddCourseButton />
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
