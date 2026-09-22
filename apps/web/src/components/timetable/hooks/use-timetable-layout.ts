import { useMemo } from "react";
import type { Course } from "~/lib/models/course";
import type { TimetableFirstDay } from "~/lib/stores/timetable-preferences";
import {
	COLUMN_BLOCK_HEIGHT_PX,
	ROW_BLOCK_WIDTH_PX,
} from "../constants";
import { useOccupiedDays } from "./use-occupied-days";

export function useTimetableLayout(
	courses: Course[],
	layoutProp: "rows" | "columns" | undefined,
	prefsLayout: "rows" | "columns",
	firstDay: TimetableFirstDay,
) {
	const effectiveLayout = layoutProp ?? prefsLayout;

	const visibleDays = useOccupiedDays(courses, firstDay);

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

		for (const course of courses) {
			for (const mt of course.meetingTimes) {
				earliestHour = Math.min(earliestHour, mt.time.start.hour);
				latestHour = Math.max(latestHour, mt.time.end.hour);
			}
		}

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

	return {
		effectiveLayout,
		visibleDays,
		timeSlots,
		columnHeight,
		rowWidth,
	};
}
