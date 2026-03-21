import { Campus } from "../../../models/campus";
import { Faculty } from "../../../models/faculty";
import { ImportResult } from "../utils/shared";
import { useCourseImporter } from "./use-course-importer";

interface UseImportProcessOptions {
	selectedCampus?: Campus;
	selectedFaculty?: Faculty;
	onImportSuccess?: (result: ImportResult) => void;
	importerOpen: boolean;
}

export function useImportProcess({
	selectedCampus,
	selectedFaculty,
	onImportSuccess,
	importerOpen,
}: UseImportProcessOptions) {
	const courseImporter = useCourseImporter({
		selectedCampus,
		selectedFaculty,
		onImportSuccess,
		importerOpen,
	});

	return courseImporter;
}
