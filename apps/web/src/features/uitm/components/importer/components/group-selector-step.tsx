import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PencilLine } from "lucide-react";
import { useState } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Button } from "~/components/ui/button";
import {
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "~/components/ui/responsive-dialog";
import { CourseStore } from "~/lib/stores/course-store";
import { UiTMCourseSection } from "../../../course-section";
import { Campus } from "../../../models/campus";
import { Faculty } from "../../../models/faculty";
import { useCourseFilter } from "../hooks/use-course-filter";
import { useGroupFiltering } from "../hooks/use-group-filtering";
import { useGroupQueries } from "../hooks/use-group-queries";
import { useImporterSelectionStore } from "../utils/shared";
import { AvailableGroupsPanel } from "./group-selector-step/available-groups-panel";
import { CampusFacultyEditor } from "./group-selector-step/campus-faculty-editor";
import {
	DesktopCoursePicker,
	MobileCoursePicker,
} from "./group-selector-step/course-pickers";

function pickSelectorState(
	state: ReturnType<typeof useImporterSelectionStore.getState>,
) {
	return {
		selectedCampus: state.selectedCampus,
		selectedFaculty: state.selectedFaculty,
		selectedCourse: state.selectedCourse,
		setSelectedCampus: state.setSelectedCampus,
		setSelectedFaculty: state.setSelectedFaculty,
		setSelectedCourse: state.setSelectedCourse,
		setCurrentStep: state.setCurrentStep,
	};
}

// --- Sub-components ---

interface CampusFacultySectionProps {
	showEditor: boolean;
	selectedCampus: Campus | undefined;
	selectedFaculty: Faculty | undefined;
	campuses: Campus[] | undefined;
	faculties: Faculty[] | undefined;
	campusesLoading: boolean;
	facultiesLoading: boolean;
	campusesError: Error | null;
	facultiesError: Error | null;
	onEditClick: () => void;
	onCampusChange: (campusCode: string) => void;
	onFacultyChange: (facultyCode: string) => void;
}

function CampusFacultySection({
	showEditor,
	selectedCampus,
	selectedFaculty,
	campuses,
	faculties,
	campusesLoading,
	facultiesLoading,
	campusesError,
	facultiesError,
	onEditClick,
	onCampusChange,
	onFacultyChange,
}: CampusFacultySectionProps) {
	return (
		<section className="space-y-2">
			{showEditor ? null : (
				<div className="flex items-center justify-between px-1">
					<h3 className="text-xs font-bold text-muted-foreground/80">
						Campus & Faculty
					</h3>
					<Button
						variant="secondary"
						size="sm"
						className="h-7 gap-1.5 px-2.5 text-[11px]"
						onClick={onEditClick}
					>
						<PencilLine className="size-3" />
						Change
					</Button>
				</div>
			)}
			{showEditor ? (
				<CampusFacultyEditor
					campuses={campuses}
					faculties={faculties}
					selectedCampus={selectedCampus}
					selectedFaculty={selectedFaculty}
					campusesLoading={campusesLoading}
					facultiesLoading={facultiesLoading}
					campusesError={campusesError}
					facultiesError={facultiesError}
					onCampusChange={onCampusChange}
					onFacultyChange={onFacultyChange}
				/>
			) : (
				<div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
					<span className="rounded bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground">
						{selectedCampus?.name}
					</span>
					{selectedFaculty ? (
						<span className="rounded bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground">
							{selectedFaculty.name}
						</span>
					) : null}
				</div>
			)}
		</section>
	);
}

// --- Main Component ---

export function GroupSelectorStep() {
	// UI state
	const [searchQuery, setSearchQuery] = useState("");
	const [selectionSheetOpen, setSelectionSheetOpen] = useState(false);
	const [editingCampusFaculty, setEditingCampusFaculty] = useState(false);

	// Selection state from store
	const {
		selectedCampus,
		selectedFaculty,
		selectedCourse,
		setSelectedCampus,
		setSelectedFaculty,
		setSelectedCourse,
		setCurrentStep,
	} = useImporterSelectionStore(
		useShallow((state) => pickSelectorState(state)),
	);

	// Campus/faculty queries
	const {
		data: campuses,
		isLoading: campusesLoading,
		error: campusesError,
	} = useQuery<Campus[]>({
		queryKey: ["uitm", "campuses"],
		queryFn: Campus.fetch,
		staleTime: 5 * 60 * 1000,
	});

	const {
		data: faculties,
		isLoading: facultiesLoading,
		error: facultiesError,
	} = useQuery<Faculty[]>({
		queryKey: ["uitm", "faculties", selectedCampus?.code],
		queryFn: () => Faculty.fetch(selectedCampus!),
		enabled: Boolean(selectedCampus?.requireFaculty),
		staleTime: 5 * 60 * 1000,
	});

	// Derived: can we proceed to course selection?
	const canSelectCourse =
		Boolean(selectedCampus) &&
		(selectedCampus?.requireFaculty ? Boolean(selectedFaculty) : true);

	const showCampusFacultyEditor = !canSelectCourse || editingCampusFaculty;

	// Course and group queries
	const {
		courses,
		coursesLoading,
		coursesError,
		availableGroups,
		groupsLoading,
		groupsError,
	} = useGroupQueries(
		canSelectCourse ? selectedCampus : undefined,
		canSelectCourse ? selectedFaculty : undefined,
		selectedCourse,
	);

	// Course filtering
	const {
		searchQuery: courseSearchQuery,
		setSearchQuery: setCourseSearchQuery,
		filteredCourses,
	} = useCourseFilter(courses);

	// Selected groups from store
	const selectedGroups = useStore(
		CourseStore,
		useShallow((state) =>
			state.courses.filter(
				(course): course is UiTMCourseSection =>
					course instanceof UiTMCourseSection,
			),
		),
	);

	// Group filtering and conflict detection
	const {
		filteredGroups,
		groupSummaries,
		selectedGroupKeys,
		groupConflicts,
		handleGroupSelect,
		handleGroupRemove,
	} = useGroupFiltering({
		availableGroups,
		selectedGroups,
		searchQuery,
	});

	// Event handlers
	const handleCourseChange = (courseCode: string) => {
		if (!courseCode) {
			setSelectedCourse(undefined);
			return;
		}
		const nextCourse = courses?.find((course) => course.code === courseCode);
		setSelectedCourse(nextCourse);
	};

	const handleCampusChange = (campusId: string) => {
		const campus = campuses?.find((c) => c.code === campusId);
		if (!campus) return;
		setSelectedCampus(campus);
		setEditingCampusFaculty(Boolean(campus.requireFaculty));
	};

	const handleFacultyChange = (facultyId: string) => {
		const faculty = faculties?.find((f) => f.code === facultyId);
		if (!faculty) return;
		setSelectedFaculty(faculty);
		setEditingCampusFaculty(false);
	};

	const handleBack = () => setCurrentStep("source");

	return (
		<>
			<ResponsiveDialogHeader className="gap-1 px-6 pt-6">
				<ResponsiveDialogTitle>Choose your groups</ResponsiveDialogTitle>
				<ResponsiveDialogDescription>
					Select campus details, then pick a course and add groups.
				</ResponsiveDialogDescription>
			</ResponsiveDialogHeader>

			<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 lg:overflow-hidden">
				{canSelectCourse ? (
					<div className="space-y-4 pt-2 lg:flex lg:items-start lg:gap-4 lg:space-y-0">
						<div className="shrink-0 space-y-4 lg:flex lg:h-[480px] lg:w-[280px] lg:flex-col">
							<CampusFacultySection
								showEditor={showCampusFacultyEditor}
								selectedCampus={selectedCampus}
								selectedFaculty={selectedFaculty}
								campuses={campuses}
								faculties={faculties}
								campusesLoading={campusesLoading}
								facultiesLoading={facultiesLoading}
								campusesError={campusesError}
								facultiesError={facultiesError}
								onEditClick={() => setEditingCampusFaculty(true)}
								onCampusChange={handleCampusChange}
								onFacultyChange={handleFacultyChange}
							/>

							<MobileCoursePicker
								courses={courses}
								selectedCourseCode={selectedCourse?.code}
								coursesLoading={coursesLoading}
								coursesError={coursesError}
								onCourseChange={handleCourseChange}
							/>

							<DesktopCoursePicker
								courses={courses}
								filteredCourses={filteredCourses}
								selectedCourseCode={selectedCourse?.code}
								coursesLoading={coursesLoading}
								coursesError={coursesError}
								searchQuery={courseSearchQuery}
								onSearchChange={setCourseSearchQuery}
								onCourseChange={handleCourseChange}
							/>
						</div>

						<AvailableGroupsPanel
							selectedCourse={selectedCourse}
							filteredGroups={filteredGroups}
							groupSummaries={groupSummaries}
							selectedGroupKeys={selectedGroupKeys}
							groupConflicts={groupConflicts}
							selectedGroups={selectedGroups}
							groupsLoading={groupsLoading}
							groupsError={groupsError}
							searchQuery={searchQuery}
							selectionSheetOpen={selectionSheetOpen}
							onSearchChange={setSearchQuery}
							onSelectionSheetOpenChange={setSelectionSheetOpen}
							onGroupSelect={handleGroupSelect}
							onGroupRemove={handleGroupRemove}
						/>
					</div>
				) : (
					<div className="space-y-4 pt-2">
						<CampusFacultySection
							showEditor={showCampusFacultyEditor}
							selectedCampus={selectedCampus}
							selectedFaculty={selectedFaculty}
							campuses={campuses}
							faculties={faculties}
							campusesLoading={campusesLoading}
							facultiesLoading={facultiesLoading}
							campusesError={campusesError}
							facultiesError={facultiesError}
							onEditClick={() => setEditingCampusFaculty(true)}
							onCampusChange={handleCampusChange}
							onFacultyChange={handleFacultyChange}
						/>
					</div>
				)}
			</div>

			<div className="mt-auto flex flex-col gap-2 p-6 sm:flex-row sm:justify-between">
				<Button
					variant="ghost"
					size="sm"
					className="w-full sm:w-auto"
					onClick={handleBack}
				>
					<ArrowLeft className="mr-2 size-4" />
					Back
				</Button>
				<Button
					variant="default"
					size="sm"
					className="w-full sm:w-auto"
					onClick={() => setCurrentStep("source")}
				>
					Done
				</Button>
			</div>
		</>
	);
}
