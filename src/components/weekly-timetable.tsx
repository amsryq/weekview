import { Clock, MapPin } from "lucide-react";
import { createContext, useContext, useMemo } from "react";
import { useStore } from "zustand";
import type { Course } from "~/lib/models/course";
import type { MeetingTime } from "~/lib/models/meeting-time";
import { CourseStore } from "~/lib/stores/course-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { Card, CardContent } from "./ui/card";
import { FitText } from "./ui/fit-text";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROW_BLOCK_WIDTH_REM = 6;
const COLUMN_BLOCK_HEIGHT_REM = 4;

interface TimetableContextProps {
	courses: Course[];
	timeSlots: string[];
	rowWidth: number;
	columnHeight: number;
	layout: "rows" | "columns";
}

const TimetableContext = createContext<TimetableContextProps | null>(null);

function useTimetable() {
	const ctx = useContext(TimetableContext);
	if (!ctx)
		throw new Error("useTimetable must be used within TimetableProvider");
	return ctx;
}

function CourseBlock({
	course,
	meetingTime,
}: {
	course: Course;
	meetingTime: MeetingTime;
}) {
	const { timeSlots, layout } = useTimetable();
	const prefs = useStore(TimetablePreferencesStore);

	const appearance = prefs.getCellAppearance(course, meetingTime);

	const {
		start: { hour: startHour, minute: startMinute },
		end: { hour: endHour, minute: endMinute },
	} = meetingTime.time;

	const startOffsetHours = startHour + startMinute / 60;
	const endOffsetHours = endHour + endMinute / 60;
	const durationHours = endOffsetHours - startOffsetHours;
	const earliestHour = Number.parseInt(timeSlots[0].split(":")[0]);

	// Layout styles
	const style: React.CSSProperties =
		layout === "rows"
			? {
					left: `${(startOffsetHours - earliestHour) * ROW_BLOCK_WIDTH_REM}rem`,
					width: `${durationHours * ROW_BLOCK_WIDTH_REM}rem`,
					top: "0.1rem",
					bottom: "0rem",
					backgroundColor: appearance.bgColor,
					borderColor: appearance.bgColor,
				}
			: {
					top: `${(startOffsetHours - earliestHour) * COLUMN_BLOCK_HEIGHT_REM}rem`,
					height: `${durationHours * COLUMN_BLOCK_HEIGHT_REM}rem`,
					left: "0rem",
					right: "0rem",
					backgroundColor: appearance.bgColor,
					borderColor: appearance.bgColor,
				};

	const justifyClass =
		appearance.textAlign === "center"
			? "center"
			: appearance.textAlign === "right"
				? "end"
				: "start";

	const InfoRow = ({
		icon,
		text,
		fontKey,
		fontSize,
		visible,
	}: {
		icon?: React.ReactNode;
		text: React.ReactNode;
		fontKey: keyof typeof appearance.weight;
		fontSize: number;
		visible: boolean;
	}) => (
		<div>
			{visible && text && (
				<div
					className={`flex items-center justify-${justifyClass} gap-1 opacity-90 font-${appearance.weight[fontKey]} truncate`}
					style={{
						fontSize,
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

	return (
		<div className="absolute rounded-lg border overflow-hidden" style={style}>
			<div
				className="p-2 h-full flex flex-col justify-between text-xs relative"
				style={{
					textAlign: appearance.textAlign,
					color: appearance.fgColor ?? "#fff",
				}}
			>
				{/* Time */}
				<InfoRow
					icon={
						<Clock
							width={appearance.fontSize.time}
							height={appearance.fontSize.time}
						/>
					}
					visible={appearance.visibility.time}
					text={`${meetingTime.time.start.toString()}-${meetingTime.time.end.toString()}`}
					fontKey="time"
					fontSize={appearance.fontSize.time}
				/>

				{/* Code + Course Name */}
				<div>
					{appearance.visibility.code && (
						<FitText
							fontSize={appearance.fontSize.code}
							className={`font-${appearance.weight.code}`}
						>
							{course.code}
						</FitText>
					)}
					{appearance.visibility.name && course.name && (
						<div
							className={`opacity-90 truncate font-${appearance.weight.name}`}
							style={{ fontSize: appearance.fontSize.name }}
						>
							{course.name}
						</div>
					)}
				</div>

				{/* Location */}
				<InfoRow
					icon={
						<MapPin
							width={appearance.fontSize.location}
							height={appearance.fontSize.location}
						/>
					}
					visible={appearance.visibility.location}
					text={meetingTime.location}
					fontKey="location"
					fontSize={appearance.fontSize.location}
				/>
			</div>
		</div>
	);
}

function DayColumn({ day, dayIndex }: { day: string; dayIndex: number }) {
	const { courses, timeSlots, columnHeight, rowWidth, layout } = useTimetable();
	const meetingDay = dayIndex + 1;

	const dayMeetings = courses.flatMap((course) =>
		course.meetingTimes
			.filter((mt) => mt.day === meetingDay)
			.map((mt) => ({ course, meetingTime: mt })),
	);

	const containerStyle =
		layout === "rows"
			? { width: `${rowWidth}rem`, height: "6rem" }
			: { height: `${columnHeight}rem` };

	const lineClass =
		layout === "rows"
			? "absolute top-0 bottom-0 border-l border-border/50"
			: "absolute left-0 right-0 border-t border-border/50";

	const lineStyle = (index: number) =>
		layout === "rows"
			? { left: `${index * ROW_BLOCK_WIDTH_REM}rem` }
			: { top: `${index * COLUMN_BLOCK_HEIGHT_REM}rem` };

	return (
		<div className={layout === "rows" ? "flex" : ""}>
			<div
				className={
					layout === "rows"
						? "w-16 flex-shrink-0 flex items-center justify-end pr-6"
						: "h-8 flex items-center justify-center"
				}
			>
				<div className="text-secondary-foreground text-sm font-medium">
					{day}
				</div>
			</div>

			<div className="relative overflow-hidden" style={containerStyle}>
				{timeSlots.map((_, index) => (
					<div key={index} className={lineClass} style={lineStyle(index)} />
				))}

				{dayMeetings.map(({ course, meetingTime }, idx) => (
					<CourseBlock
						key={`${course.code}-${meetingTime.day}-${idx}`}
						course={course}
						meetingTime={meetingTime}
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
	const { timeSlots } = useTimetable();

	return (
		<div className="overflow-x-auto">
			<div id={containerId} className="bg-card min-w-fit">
				<div className="flex pb-2">
					<div className="w-16 flex-shrink-0" />
					<div className="flex">
						{timeSlots.map((time: string) => (
							<div
								key={time}
								className="text-sm text-muted-foreground text-center -translate-x-4 flex flex-shrink-0"
								style={{ width: `${ROW_BLOCK_WIDTH_REM}rem` }}
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
	);
}

// TODO: This is currently unfinished
function ColumnLayout({
	visibleDays,
	containerId,
}: {
	visibleDays: string[];
	containerId: string;
}) {
	const { timeSlots } = useTimetable();
	const timeFontSize = useStore(
		TimetablePreferencesStore,
		(s) => s.cellAppearance.fontSize.time,
	);
	const timeWeight = useStore(
		TimetablePreferencesStore,
		(s) => s.cellAppearance.weight.time,
	);
	return (
		<div
			id={containerId}
			className="grid bg-card"
			style={{ gridTemplateColumns: `auto repeat(${visibleDays.length}, 1fr)` }}
		>
			<div className="space-y-0">
				<div className="h-8" />
				{timeSlots.map((time: string) => (
					<div
						key={time}
						className="text-sm text-muted-foreground text-right pr-2 flex -translate-y-2 justify-end"
						style={{ height: `${COLUMN_BLOCK_HEIGHT_REM}rem` }}
					>
						<span
							style={{ fontSize: `${timeFontSize}px` }}
							className={`font-${timeWeight}`}
						>
							{time}
						</span>
					</div>
				))}
			</div>

			{visibleDays.map((day: string) => (
				<DayColumn key={day} day={day} dayIndex={DAYS.indexOf(day)} />
			))}
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

export default function WeeklyTimetable({
	layout,
	courses: _courses,
	containerId = "weekly-timetable",
}: WeeklyTimetableProps) {
	const courses = useStore(CourseStore, (state) => _courses || state.courses);
	const prefsLayout = useStore(TimetablePreferencesStore, (s) => s.layout);
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
				columnHeight: slots.length * COLUMN_BLOCK_HEIGHT_REM,
				rowWidth: slots.length * ROW_BLOCK_WIDTH_REM,
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
			columnHeight: slots.length * COLUMN_BLOCK_HEIGHT_REM,
			rowWidth: slots.length * ROW_BLOCK_WIDTH_REM,
		};
	}, [courses]);

	return (
		<Card>
			<CardContent className="max-w-[95vw]">
				<TimetableContext.Provider
					value={{
						courses,
						timeSlots,
						columnHeight,
						rowWidth,
						layout: effectiveLayout,
					}}
				>
					{courses.length === 0 ? (
						<div className="text-center py-12 space-y-2">
							<p className="text-lg text-muted-foreground">
								No courses added yet.
							</p>
							<p className="text-sm text-muted-foreground">
								Click "Manage Courses" to get started!
							</p>
						</div>
					) : effectiveLayout === "rows" ? (
						<RowLayout visibleDays={visibleDays} containerId={containerId} />
					) : (
						<ColumnLayout visibleDays={visibleDays} containerId={containerId} />
					)}
				</TimetableContext.Provider>
			</CardContent>
		</Card>
	);
}
