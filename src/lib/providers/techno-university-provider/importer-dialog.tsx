import { useQuery } from "@tanstack/react-query";
import { pick } from "es-toolkit";
import { AlertTriangleIcon } from "lucide-react";
import { JSX } from "react";
import { create, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxTrigger,
} from "~/components/ui/shadcn-io/combobox";
import { CourseStore } from "~/lib/stores/course-store";
import { Campus } from "./campus";
import { Course } from "./course";
import { Faculty } from "./faculty";
import { Group } from "./group";
import { TechnoGroup } from "./techno-course";

const useImporterSelectionStore = create<{
	open: boolean;
	currentStep: number;
	selectedCampus?: Campus;
	selectedFaculty?: Faculty;
	selectedCourse?: Course;
	setOpen: (open: boolean) => void;
	setCurrentStep: (step: number) => void;
	setSelectedCampus: (c?: Campus) => void;
	setSelectedFaculty: (f?: Faculty) => void;
	setSelectedCourse: (c?: Course) => void;
}>((set) => ({
	open: false,
	currentStep: 0,
	selectedCampus: undefined,
	selectedFaculty: undefined,
	selectedCourse: undefined,
	setOpen: (open) => set({ open }),
	setCurrentStep: (step) => set({ currentStep: step }),
	setSelectedCampus: (c) =>
		set({
			selectedCampus: c,
			selectedFaculty: undefined,
			selectedCourse: undefined,
		}),
	setSelectedFaculty: (f) =>
		set({
			selectedFaculty: f,
			selectedCourse: undefined,
		}),
	setSelectedCourse: (c) => set({ selectedCourse: c }),
}));

function UnaffiliationNotice() {
	return (
		<div className="w-full flex mt-2 justify-center">
			<div className="w-full max-w-lg">
				<Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
					<AlertTriangleIcon />
					<AlertTitle>Notice</AlertTitle>
					<AlertDescription className="text-yellow-700 dark:text-yellow-300">
						Weekview is not affiliated with or endorsed by UiTM. Please use this
						feature with discretion and verify your timetable against official
						sources. While the data is sourced from UiTM, it may be incomplete
						or outdated.
					</AlertDescription>
				</Alert>
			</div>
		</div>
	);
}

function CourseAndFacultySelectorStep() {
	const {
		selectedCampus,
		setSelectedCampus,
		selectedFaculty,
		setSelectedFaculty,
		setCurrentStep,
	} = useImporterSelectionStore();

	// Campuses
	const {
		data: campuses,
		isLoading: campusesLoading,
		error: campusesError,
	} = useQuery<Campus[]>({
		queryKey: ["uitm", "campuses"],
		queryFn: Campus.fetch,
		staleTime: 5 * 60 * 1000,
	});

	// Faculties (per-campus)
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

	const handleCampusChange = (campusId: string) => {
		const campus = campuses?.find((c) => c.code === campusId);
		if (campus) {
			setSelectedCampus(campus);
			// Reset dependent selections
			setSelectedFaculty(undefined);
		}
	};

	const handleFacultyChange = (facultyId: string) => {
		const faculty = faculties?.find((f) => f.code === facultyId);
		if (faculty) {
			setSelectedFaculty(faculty);
		}
	};

	const canProceed =
		selectedCampus && (!selectedCampus.requireFaculty || selectedFaculty);

	return (
		<>
			<DialogHeader>
				<DialogTitle>Choose your campus & faculty</DialogTitle>
				<DialogDescription>
					Please select your campus and faculty from the dropdown menus.
				</DialogDescription>

				<UnaffiliationNotice />
			</DialogHeader>

			<div className="flex flex-col gap-2">
				<Combobox
					type="campus"
					loading={campusesLoading}
					loadingText="Loading campuses..."
					data={campuses?.map((c) => ({ value: c.code, label: c.name })) || []}
					value={selectedCampus?.code || ""}
					onValueChange={handleCampusChange}
				>
					<ComboboxTrigger
						className={`w-full ${campusesLoading ? "cursor-wait" : ""}`}
						disabled={campusesLoading}
					/>
					<ComboboxContent>
						<ComboboxInput />
						<ComboboxEmpty>
							{campusesLoading ? "Loading campuses..." : "No campuses found"}
						</ComboboxEmpty>
						<ComboboxList>
							<ComboboxGroup>
								{campuses?.map(({ code, name }, idx) => (
									<ComboboxItem key={idx} value={code}>
										{name}
									</ComboboxItem>
								))}
							</ComboboxGroup>
						</ComboboxList>
					</ComboboxContent>
				</Combobox>

				{campusesError && (
					<div className="text-sm text-red-500">{campusesError.message}</div>
				)}

				{(!selectedCampus || selectedCampus.requireFaculty) && (
					<Combobox
						type="faculty"
						loading={facultiesLoading}
						loadingText="Loading faculties..."
						data={
							faculties?.map(({ code, name }) => ({
								value: code,
								label: name,
							})) || []
						}
						value={selectedFaculty?.code || ""}
						onValueChange={handleFacultyChange}
					>
						<ComboboxTrigger
							className={`w-full ${
								facultiesLoading
									? "cursor-wait"
									: !faculties
										? "cursor-not-allowed opacity-50"
										: ""
							}`}
							disabled={
								!selectedCampus?.requireFaculty ||
								facultiesLoading ||
								!faculties
							}
						/>
						<ComboboxContent>
							<ComboboxInput />
							<ComboboxEmpty>
								{facultiesLoading
									? "Loading faculties..."
									: "No faculties found"}
							</ComboboxEmpty>
							<ComboboxList>
								<ComboboxGroup>
									{faculties?.map(({ code: id, name }, idx) => (
										<ComboboxItem key={idx} value={id}>
											{name}
										</ComboboxItem>
									))}
								</ComboboxGroup>
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				)}

				{facultiesError && (
					<div className="text-sm text-red-500">
						{(facultiesError as Error).message}
					</div>
				)}
			</div>

			<DialogFooter className="justify-end">
				<Button
					variant="outline"
					disabled={!canProceed}
					onClick={() => setCurrentStep(1)}
				>
					Next
				</Button>
			</DialogFooter>
		</>
	);
}

function GroupSelectorStep() {
	const {
		selectedCampus,
		selectedFaculty,
		selectedCourse,
		setSelectedCourse,
		setCurrentStep,
	} = useImporterSelectionStore();

	const selectedGroups = useStore(
		CourseStore,
		useShallow((state) =>
			state.courses.filter((a): a is TechnoGroup => a instanceof TechnoGroup),
		),
	);
	// Courses list for selected campus/faculty
	const {
		data: courses,
		isLoading: coursesLoading,
		error: coursesError,
	} = useQuery<Course[]>({
		queryKey: ["uitm", "courses", selectedFaculty?.code],
		queryFn: () => Course.fetch(selectedFaculty ?? selectedCampus!),
		enabled: Boolean(selectedFaculty || selectedCampus),
		staleTime: 5 * 60 * 1000,
	});

	// Groups for selected course
	const {
		data: availableGroups,
		isLoading: groupsLoading,
		error: groupsError,
	} = useQuery<Group[], Error, TechnoGroup[]>({
		queryKey: ["uitm", "groups", selectedCourse?.code],
		queryFn: () => Group.fetch(selectedCourse!),
		enabled: Boolean(selectedCourse),
		select: (groups) => groups.map((g) => g.toTechnoCourse()),
	});

	const handleCourseSelect = (course: Course) => {
		setSelectedCourse(course);
	};

	const handleGroupSelect = (technoCourse: TechnoGroup) => {
		const exists = selectedGroups.find(
			(sg) =>
				sg.internal.code === technoCourse.internal.code &&
				sg.internal.group === technoCourse.internal.group,
		);

		if (!exists) {
			const state = CourseStore.getState();
			if (!state.hasTimeConflicts(technoCourse)) {
				state.addCourse(technoCourse);
			}
		}
	};

	const handleGroupRemove = (course: string, group: string) => {
		const id = selectedGroups.find(
			(sg) => sg.internal.code === course && sg.internal.group === group,
		)?.id;
		if (id) CourseStore.getState().removeCourse(id);
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Groups</DialogTitle>
				<DialogDescription>
					Select and manage your selected groups.
				</DialogDescription>
			</DialogHeader>

			<div className="flex gap-4 py-4 h-[400px]">
				{/* Left side - Courses and Groups */}
				<div className="flex flex-col gap-4 flex-1">
					{/* Courses Section */}
					<div className="flex flex-col gap-2">
						<h3 className="text-center font-medium">Courses</h3>
						<div className="border rounded-lg p-3 h-32 overflow-y-auto bg-muted/30">
							{coursesLoading ? (
								<div className="text-sm text-muted-foreground italic p-2">
									Loading courses...
								</div>
							) : coursesError ? (
								<div className="text-sm text-red-500 p-2">
									{coursesError.message}
								</div>
							) : courses && courses.length > 0 ? (
								courses.map((course, idx) => (
									<button
										key={idx}
										onClick={() => handleCourseSelect(course)}
										className={`block w-full text-left p-2 rounded hover:bg-muted transition-colors ${
											selectedCourse?.code === course.code ? "bg-muted" : ""
										}`}
									>
										<div className="text-sm">{course.code}</div>
									</button>
								))
							) : (
								<div className="text-sm text-muted-foreground italic p-2">
									No courses available
								</div>
							)}
						</div>
					</div>

					{/* Groups Section */}
					<div className="flex flex-col gap-2">
						<h3 className="text-center font-medium">Groups</h3>
						<div className="border rounded-lg p-3 h-32 overflow-y-auto bg-muted/30">
							{groupsLoading ? (
								<div className="text-sm text-muted-foreground italic p-2">
									Loading groups...
								</div>
							) : groupsError ? (
								<div className="text-sm text-red-500 p-2">
									{(groupsError as Error).message}
								</div>
							) : selectedCourse && availableGroups?.length ? (
								availableGroups.map((technoCourse, idx) => {
									const alreadyExists = selectedGroups.includes(technoCourse);
									const conflicts =
										CourseStore.getState().hasTimeConflicts(technoCourse);

									const reason = alreadyExists
										? "Already added"
										: conflicts
											? "Time conflict"
											: undefined;

									return (
										<button
											key={idx}
											onClick={() => handleGroupSelect(technoCourse)}
											className={`block w-full text-left p-2 rounded transition-colors ${
												reason
													? "opacity-60 cursor-not-allowed"
													: "hover:bg-muted"
											}`}
											disabled={Boolean(reason)}
											title={reason}
										>
											<div className="text-sm">
												{technoCourse.internal.group}
											</div>
											{reason && (
												<div className="text-xs text-muted-foreground mt-1">
													{reason}
												</div>
											)}
										</button>
									);
								})
							) : (
								<div className="text-sm text-muted-foreground italic p-2">
									{selectedCourse
										? "No groups available"
										: "Select a course to view groups"}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right side - Selected Groups */}
				<div className="flex flex-col gap-2 flex-1">
					<div className="border rounded-lg p-3 h-full overflow-y-auto">
						{selectedGroups.length > 0 ? (
							<div className="space-y-2">
								{selectedGroups.map(({ internal: { code, group } }, idx) => (
									<div key={idx} className="border rounded-lg p-3 bg-muted/30">
										<div className="flex items-center justify-between">
											<div>
												<div className="font-medium">{code}</div>
												<div className="text-sm text-muted-foreground">
													{group}
												</div>
											</div>
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="sm"
													className="h-6 w-6 p-0"
													title="Edit"
												>
													<span className="text-xs">✏️</span>
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="h-6 w-6 p-0"
													title="Remove"
													onClick={() => handleGroupRemove(code, group)}
												>
													<span className="text-xs">🗑️</span>
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-sm text-muted-foreground italic p-2">
								No groups selected
							</div>
						)}
					</div>
				</div>
			</div>

			<DialogFooter className="justify-start">
				<Button variant="outline" onClick={() => setCurrentStep(0)}>
					Previous
				</Button>
			</DialogFooter>
		</>
	);
}

export default function TechnoUniversityImporterDialog({
	children,
}: {
	children: JSX.Element;
}) {
	const { open, setOpen, currentStep } = useImporterSelectionStore(
		useShallow((s) => pick(s, ["open", "setOpen", "currentStep"])),
	);

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
	};

	return (
		<>
			<Dialog open={open && currentStep === 0} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className={`sm:max-w-5xl w-auto`}>
					<CourseAndFacultySelectorStep />
				</DialogContent>
			</Dialog>
			<Dialog open={open && currentStep === 1} onOpenChange={handleOpenChange}>
				<DialogContent className="sm:max-w-5xl w-full">
					<GroupSelectorStep />
				</DialogContent>
			</Dialog>
		</>
	);
}
