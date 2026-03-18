import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { Campus } from "../../../../models/campus";
import type { Faculty } from "../../../../models/faculty";

interface CampusSelectorProps {
	campuses: Campus[];
	selectedCampus?: Campus;
	detectedCampusLabel: string;
	detectedCampusCode: string;
	loadingCampuses: boolean;
	campusMismatch: boolean;
	isAutoSelection: boolean;
	onCampusChange: (campus?: Campus) => void;
}

function CampusSelector({
	campuses,
	selectedCampus,
	detectedCampusLabel,
	detectedCampusCode,
	loadingCampuses,
	campusMismatch,
	isAutoSelection,
	onCampusChange,
}: CampusSelectorProps) {
	const handleCampusValueChange = (value: string) => {
		if (value === "auto") {
			onCampusChange(undefined);
			return;
		}

		const campus = campuses.find((item) => item.code === value);
		if (!campus) return;
		onCampusChange(campus);
	};

	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium text-foreground">Campus</label>
			<Select
				value={selectedCampus?.code ?? "auto"}
				onValueChange={handleCampusValueChange}
				disabled={loadingCampuses}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Use detected campus" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="auto">
						{detectedCampusLabel
							? `Auto – ${detectedCampusLabel}`
							: "Auto (use detected details)"}
					</SelectItem>
					{campuses.map((campus) => (
						<SelectItem key={campus.code} value={campus.code}>
							{campus.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{isAutoSelection ? (
				<p className="text-xs text-muted-foreground">
					{detectedCampusCode
						? "We’ll use the campus detected from your course slip."
						: "No campus detected in your slip yet."}
				</p>
			) : (
				<>
					{campusMismatch && detectedCampusLabel && (
						<p className="text-xs text-amber-600">
							Detected campus {detectedCampusLabel} doesn't match your
							selection. Double-check before importing.
						</p>
					)}
					{!campusMismatch && detectedCampusLabel && (
						<p className="text-xs text-muted-foreground">
							Detected campus: {detectedCampusLabel}
						</p>
					)}
				</>
			)}
		</div>
	);
}

interface FacultySelectorProps {
	faculties: Faculty[];
	selectedFaculty?: Faculty;
	detectedFacultyLabel: string;
	suggestedFaculty: string;
	loadingFaculties: boolean;
	facultyMismatch: boolean;
	onFacultyChange: (faculty?: Faculty) => void;
}

function FacultySelector({
	faculties,
	selectedFaculty,
	detectedFacultyLabel,
	suggestedFaculty,
	loadingFaculties,
	facultyMismatch,
	onFacultyChange,
}: FacultySelectorProps) {
	const handleFacultyValueChange = (value: string) => {
		const faculty = faculties.find((item) => item.code === value);
		onFacultyChange(faculty);
	};

	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium text-foreground">
				Faculty
				{suggestedFaculty && (
					<span className="ml-2 text-xs font-normal text-muted-foreground">
						Detected: {suggestedFaculty}
					</span>
				)}
			</label>
			<Select
				value={selectedFaculty?.code ?? ""}
				onValueChange={handleFacultyValueChange}
				disabled={loadingFaculties || faculties.length === 0}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select a faculty..." />
				</SelectTrigger>
				<SelectContent>
					{faculties.map((faculty) => (
						<SelectItem key={faculty.code} value={faculty.code}>
							{faculty.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{facultyMismatch && detectedFacultyLabel && (
				<p className="text-xs text-amber-600">
					Detected faculty {detectedFacultyLabel} doesn't match your selection.
					Double-check before importing.
				</p>
			)}
		</div>
	);
}

interface AutoSelectionSummaryProps {
	detectedCampusLabel: string;
	detectedCampusCode: string;
	detectedFacultyLabel: string;
	detectedFacultyCode: string;
	requiresFacultyInAuto: boolean;
	shouldShowParsedFaculty: boolean;
}

function AutoSelectionSummary({
	detectedCampusLabel,
	detectedCampusCode,
	detectedFacultyLabel,
	detectedFacultyCode,
	requiresFacultyInAuto,
	shouldShowParsedFaculty,
}: AutoSelectionSummaryProps) {
	return (
		<div className="space-y-4 rounded-lg border border-border bg-background p-4 text-sm">
			<div className="space-y-1">
				<span className="text-sm font-medium text-foreground">Campus</span>
				{detectedCampusCode ? (
					<p className="text-sm text-foreground">{detectedCampusLabel}</p>
				) : (
					<p className="text-sm text-destructive">
						We couldn't detect a campus yet. Select one manually above to
						continue.
					</p>
				)}
			</div>
			{shouldShowParsedFaculty && (
				<div className="space-y-1">
					<span className="text-sm font-medium text-foreground">Faculty</span>
					{detectedFacultyCode ? (
						<p className="text-sm text-foreground">{detectedFacultyLabel}</p>
					) : requiresFacultyInAuto ? (
						<p className="text-sm text-destructive">
							This campus needs a faculty. Pick one manually if it doesn't
							appear in your slip.
						</p>
					) : (
						<p className="text-sm text-muted-foreground">
							No faculty is required for this campus.
						</p>
					)}
				</div>
			)}
		</div>
	);
}

interface CampusFacultySelectorProps {
	campuses: Campus[];
	faculties: Faculty[];
	selectedCampus?: Campus;
	selectedFaculty?: Faculty;
	detectedCampusLabel: string;
	detectedFacultyLabel: string;
	detectedCampusCode: string;
	detectedFacultyCode: string;
	isAutoSelection: boolean;
	loadingCampuses: boolean;
	loadingFaculties: boolean;
	campusMismatch: boolean;
	facultyMismatch: boolean;
	requiresFacultyInAuto: boolean;
	shouldShowParsedFaculty: boolean;
	suggestedFaculty: string;
	onCampusChange: (campus?: Campus) => void;
	onFacultyChange: (faculty?: Faculty) => void;
}

export function CampusFacultySelector({
	campuses,
	faculties,
	selectedCampus,
	selectedFaculty,
	detectedCampusLabel,
	detectedFacultyLabel,
	detectedCampusCode,
	detectedFacultyCode,
	isAutoSelection,
	loadingCampuses,
	loadingFaculties,
	campusMismatch,
	facultyMismatch,
	requiresFacultyInAuto,
	shouldShowParsedFaculty,
	suggestedFaculty,
	onCampusChange,
	onFacultyChange,
}: CampusFacultySelectorProps) {
	return (
		<div className="grid gap-3">
			<CampusSelector
				campuses={campuses}
				selectedCampus={selectedCampus}
				detectedCampusLabel={detectedCampusLabel}
				detectedCampusCode={detectedCampusCode}
				loadingCampuses={loadingCampuses}
				campusMismatch={campusMismatch}
				isAutoSelection={isAutoSelection}
				onCampusChange={onCampusChange}
			/>

			{isAutoSelection ? (
				<AutoSelectionSummary
					detectedCampusLabel={detectedCampusLabel}
					detectedCampusCode={detectedCampusCode}
					detectedFacultyLabel={detectedFacultyLabel}
					detectedFacultyCode={detectedFacultyCode}
					requiresFacultyInAuto={requiresFacultyInAuto}
					shouldShowParsedFaculty={shouldShowParsedFaculty}
				/>
			) : (
				selectedCampus?.requireFaculty && (
					<FacultySelector
						faculties={faculties}
						selectedFaculty={selectedFaculty}
						detectedFacultyLabel={detectedFacultyLabel}
						suggestedFaculty={suggestedFaculty}
						loadingFaculties={loadingFaculties}
						facultyMismatch={facultyMismatch}
						onFacultyChange={onFacultyChange}
					/>
				)
			)}
		</div>
	);
}
