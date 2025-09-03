import { createContext, useContext, useMemo } from "react";
import { RequiredDeep } from "type-fest";
import { useStore } from "zustand";
import type { CellAppearance } from "~/lib/models/cell-appearance";
import type { Course } from "~/lib/models/course";
import type { MeetingTime } from "~/lib/models/meeting-time";
import { CourseStore } from "~/lib/stores/course-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { CourseBlock } from "./course-block";
import { Card, CardContent } from "./ui/card";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROW_BLOCK_WIDTH_PX = 84;
const COLUMN_BLOCK_HEIGHT_PX = 84;

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
			? "absolute top-0 bottom-0 border-l border-border/50"
			: "absolute left-0 right-0 border-t border-border/50";

	const lineStyle = (index: number) =>
		layout === "rows"
			? { left: `${index * ROW_BLOCK_WIDTH_PX}px` }
			: { top: `${index * COLUMN_BLOCK_HEIGHT_PX}px` };

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
								style={{ width: `${ROW_BLOCK_WIDTH_PX}px` }}
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

function ColumnLayout({
	visibleDays,
	containerId,
}: {
	visibleDays: string[];
	containerId: string;
}) {
	const { timeSlots } = useTimetable();
	return (
		<div className="overflow-y-auto">
			<div
				id={containerId}
				className="grid bg-card"
				style={{
					gridTemplateColumns: `auto repeat(${visibleDays.length}, 1fr)`,
				}}
			>
				<div className="space-y-0">
					<div className="h-8" />
					{timeSlots.map((time: string) => (
						<span
							key={time}
							style={{ height: `${COLUMN_BLOCK_HEIGHT_PX}px` }}
							className="flex text-[12px] text-muted-foreground font-semibold pr-2 -translate-y-2 justify-end"
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
					{effectiveLayout === "rows" ? (
						<RowLayout visibleDays={visibleDays} containerId={containerId} />
					) : (
						<ColumnLayout visibleDays={visibleDays} containerId={containerId} />
					)}
				</TimetableContext.Provider>
			</CardContent>
		</Card>
	);
}
