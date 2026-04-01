import { useDeferredValue, useMemo, useState } from "react";
import type { Course } from "../../../models/course";

interface UseCourseFilterResult {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	filteredCourses: Course[];
}

export function useCourseFilter(
	courses: Course[] | undefined,
): UseCourseFilterResult {
	const [searchQuery, setSearchQuery] = useState("");
	const deferredQuery = useDeferredValue(searchQuery);

	const filteredCourses = useMemo(() => {
		const query = deferredQuery.trim().toLowerCase();
		if (!query) return courses ?? [];
		return (courses ?? []).filter((course) =>
			course.code.toLowerCase().includes(query),
		);
	}, [deferredQuery, courses]);

	return {
		searchQuery,
		setSearchQuery,
		filteredCourses,
	};
}
