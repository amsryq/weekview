import { pick } from "es-toolkit";
import { useShallow } from "zustand/react/shallow";
import { Campus } from "../../../models/campus";
import { parseSchedule } from "../../../utils/parse-schedule";
import { useImporterSelectionStore } from "../utils/shared";

const normalizeCode = (value?: string | null) =>
	value?.trim().toLowerCase() ?? "";

interface UseImportSelectionOptions {
	rawText: string;
	parsedSchedule: ReturnType<typeof parseSchedule>;
	campuses: Campus[];
}

export function useImportSelection({
	rawText,
	parsedSchedule,
	campuses,
}: UseImportSelectionOptions) {
	const {
		selectedCampus,
		selectedFaculty,
		setCurrentStep,
		setSelectedCampus,
		setSelectedFaculty,
	} = useImporterSelectionStore(
		useShallow((state) =>
			pick(state, [
				"selectedCampus",
				"selectedFaculty",
				"setCurrentStep",
				"setSelectedCampus",
				"setSelectedFaculty",
			]),
		),
	);

	const detectedCampus = parsedSchedule.campus;
	const detectedFaculty = parsedSchedule.faculty;
	const detectedCampusCode = normalizeCode(detectedCampus?.code);
	const detectedFacultyCode = normalizeCode(detectedFaculty?.code);
	const selectedCampusCode = normalizeCode(selectedCampus?.code);
	const selectedFacultyCode = normalizeCode(selectedFaculty?.code);

	const matchedDetectedCampus = detectedCampusCode
		? campuses.find(
				(campus) => normalizeCode(campus.code) === detectedCampusCode,
			)
		: undefined;

	const isAutoSelection = !selectedCampus;

	const campusMismatch =
		!isAutoSelection &&
		detectedCampusCode !== "" &&
		selectedCampusCode !== "" &&
		detectedCampusCode !== selectedCampusCode;

	const facultyMismatch =
		!isAutoSelection &&
		detectedFacultyCode !== "" &&
		selectedFacultyCode !== "" &&
		detectedFacultyCode !== selectedFacultyCode;

	const requiresFacultyInAuto = isAutoSelection
		? (matchedDetectedCampus?.requireFaculty ?? true)
		: false;

	const shouldShowParsedFaculty = isAutoSelection
		? true
		: Boolean(selectedCampus?.requireFaculty);

	const autoReady =
		detectedCampusCode !== "" &&
		(!requiresFacultyInAuto || detectedFacultyCode !== "");

	const manualReady =
		Boolean(selectedCampus) &&
		(!selectedCampus?.requireFaculty || Boolean(selectedFaculty));

	const canImport =
		rawText.trim() !== "" && (isAutoSelection ? autoReady : manualReady);

	const onCampusChange = (campus?: Campus) => {
		setSelectedCampus(campus);
		setSelectedFaculty(undefined);
	};

	return {
		selectedCampus,
		selectedFaculty,
		isAutoSelection,
		campusMismatch,
		facultyMismatch,
		requiresFacultyInAuto,
		shouldShowParsedFaculty,
		canImport,
		onCampusChange,
		onFacultyChange: setSelectedFaculty,
		setCurrentStep,
	};
}
