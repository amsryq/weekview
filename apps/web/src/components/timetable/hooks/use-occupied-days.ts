import { useMemo } from "react";
import type { Course } from "~/lib/models/course";
import type { TimetableFirstDay } from "~/lib/stores/timetable-preferences";
import { DAYS, DAY_TO_INDEX } from "../constants";

function shiftDays(firstDay: "monday" | "sunday") {
	const offset = firstDay === "sunday" ? DAYS.length - 1 : 0;
	return [...DAYS.slice(offset), ...DAYS.slice(0, offset)];
}

function countMeetingsOnDay(courses: Course[], day: number) {
	return courses.reduce(
		(count, course) =>
			count + course.meetingTimes.filter((meetingTime) => meetingTime.day === day).length,
		0,
	);
}

export function useOccupiedDays(
	courses: Course[],
	firstDay: TimetableFirstDay,
) {
	const occupiedDays = useMemo(
		() =>
			new Set(
				courses.flatMap((course) =>
					course.meetingTimes.map((meetingTime) => meetingTime.day),
				),
			),
		[courses],
	);

	return useMemo(() => {
		const dayOrder =
			firstDay === "auto"
				? countMeetingsOnDay(courses, 7) > countMeetingsOnDay(courses, 5)
					? shiftDays("sunday")
					: shiftDays("monday")
				: shiftDays(firstDay);
		const lastVisibleDayIndex = Math.max(
			4,
			...dayOrder.reduce<number[]>((indices, day, index) => {
				if (occupiedDays.has(DAY_TO_INDEX.get(day)! + 1)) indices.push(index);
				return indices;
			}, []),
		);

		return dayOrder.slice(0, lastVisibleDayIndex + 1);
	}, [courses, firstDay, occupiedDays]);
}