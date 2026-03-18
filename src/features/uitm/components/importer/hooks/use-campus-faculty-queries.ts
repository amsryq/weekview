import { useQuery } from "@tanstack/react-query";
import { Campus } from "../../../models/campus";
import { Faculty } from "../../../models/faculty";

interface UseCampusFacultyQueriesOptions {
	importerOpen: boolean;
	selectedCampus?: Campus;
}

export function useCampusFacultyQueries({
	importerOpen,
	selectedCampus,
}: UseCampusFacultyQueriesOptions) {
	const { data: campuses = [], isLoading: loadingCampuses } = useQuery({
		queryKey: ["uitm", "campuses"],
		queryFn: Campus.fetch,
		staleTime: 5 * 60 * 1000,
		enabled: importerOpen,
	});

	const { data: faculties = [], isLoading: loadingFaculties } = useQuery({
		queryKey: ["uitm", "faculties", selectedCampus?.code],
		queryFn: () => Faculty.fetch(selectedCampus!),
		staleTime: 5 * 60 * 1000,
		enabled: Boolean(selectedCampus?.requireFaculty),
	});

	return {
		campuses,
		loadingCampuses,
		faculties,
		loadingFaculties,
	};
}
