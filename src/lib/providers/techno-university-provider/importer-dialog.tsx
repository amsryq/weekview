import { useQuery } from "@tanstack/react-query";
import { createContext, type JSX, useContext, useState } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Button } from "~/components/ui/button";
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
import {
	DialogStack,
	DialogStackBody,
	DialogStackContent,
	DialogStackDescription,
	DialogStackFooter,
	DialogStackHeader,
	DialogStackNext,
	DialogStackOverlay,
	DialogStackPrevious,
	DialogStackTitle,
	DialogStackTrigger,
} from "~/components/ui/shadcn-io/dialog-stack";
import { CourseStore } from "~/lib/stores/course-store";
import {
	fetchCampuses,
	fetchCourses,
	fetchFaculties,
	fetchTimetable,
	timetableDataToTechnoCourses,
} from "./mock-api";
import { TechnoCourse } from "./techno-course";
import type { ServerCampus, ServerCourse, ServerFaculty } from "./types";

interface ImporterSelectionContextValue {
	selectedCampus?: ServerCampus;
	setSelectedCampus: (c?: ServerCampus) => void;
	selectedFaculty?: ServerFaculty;
	setSelectedFaculty: (f?: ServerFaculty) => void;
	selectedCourse?: ServerCourse;
	setSelectedCourse: (c?: ServerCourse) => void;
}

const ImporterSelectionContext = createContext<
	ImporterSelectionContextValue | undefined
>(undefined);

function useImporterSelection() {
	const ctx = useContext(ImporterSelectionContext);
	if (!ctx)
		throw new Error(
			"useImporterSelection must be used within TechnoUniversityImporterDialog",
		);
	return ctx;
}

function CourseAndFacultySelectorDialog() {
	const {
		selectedCampus,
		setSelectedCampus,
		selectedFaculty,
		setSelectedFaculty,
	} = useImporterSelection();
	// Campuses
	const {
		data: campuses,
		isLoading: campusesLoading,
		error: campusesError,
	} = useQuery({
		queryKey: ["techno", "campuses"],
		queryFn: fetchCampuses,
		staleTime: 5 * 60 * 1000,
	});

	// Faculties (per-campus)
	const {
		data: faculties,
		isLoading: facultiesLoading,
		error: facultiesError,
	} = useQuery({
		queryKey: ["techno", "faculties"],
		queryFn: fetchFaculties,
		enabled: Boolean(selectedCampus?.requiresFaculty),
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
		selectedCampus && (!selectedCampus.requiresFaculty || selectedFaculty);

	return (
		<>
			<DialogStackHeader>
				<DialogStackTitle>Choose your campus & faculty</DialogStackTitle>
				<DialogStackDescription>
					Please select your campus and faculty from the dropdown menus.
				</DialogStackDescription>
			</DialogStackHeader>

			<div className="flex flex-col gap-2 py-4">
				<Combobox
					type="campus"
					loading={campusesLoading}
					loadingText="Loading campuses..."
					data={
						campuses?.map(({ code, name }) => ({ value: code, label: name })) ||
						[]
					}
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
								{campuses?.map(({ code, name }) => (
									<ComboboxItem key={code} value={code}>
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

				<Combobox
					type="faculty"
					loading={facultiesLoading}
					loadingText="Loading faculties..."
					data={
						faculties?.map(({ code: id, name }) => ({
							value: id,
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
							!selectedCampus?.requiresFaculty || facultiesLoading || !faculties
						}
					/>
					<ComboboxContent>
						<ComboboxInput />
						<ComboboxEmpty>
							{facultiesLoading ? "Loading faculties..." : "No faculties found"}
						</ComboboxEmpty>
						<ComboboxList>
							<ComboboxGroup>
								{faculties?.map(({ code: id, name }) => (
									<ComboboxItem key={id} value={id}>
										{name}
									</ComboboxItem>
								))}
							</ComboboxGroup>
						</ComboboxList>
					</ComboboxContent>
				</Combobox>

				{facultiesError && (
					<div className="text-sm text-red-500">
						{(facultiesError as Error).message}
					</div>
				)}
			</div>

			<DialogStackFooter className="justify-end">
				<DialogStackNext asChild>
					<Button variant="outline" disabled={!canProceed}>
						Next
					</Button>
				</DialogStackNext>
			</DialogStackFooter>
		</>
	);
}

function GroupSelectorDialog() {
	const { selectedCampus, selectedFaculty, selectedCourse, setSelectedCourse } =
		useImporterSelection();

	const selectedGroups = useStore(
		CourseStore,
		useShallow((state) =>
			state.courses.filter((a): a is TechnoCourse => a instanceof TechnoCourse),
		),
	);

	// Courses list for selected campus/faculty
	const {
		data: courses,
		isLoading: coursesLoading,
		error: coursesError,
	} = useQuery({
		queryKey: [
			"techno",
			"courses",
			selectedCampus?.code,
			selectedCampus?.requiresFaculty ? selectedFaculty?.code : "",
		],
		queryFn: () =>
			fetchCourses(
				selectedCampus!.code,
				selectedCampus?.requiresFaculty ? selectedFaculty?.code : undefined,
			),
		enabled: Boolean(
			selectedCampus && (!selectedCampus.requiresFaculty || selectedFaculty),
		),
		staleTime: 5 * 60 * 1000,
	});

	// Groups for selected course
	const {
		data: availableGroups,
		isLoading: groupsLoading,
		error: groupsError,
	} = useQuery({
		queryKey: ["techno", "timetable", selectedCourse?.code],
		queryFn: () => fetchTimetable(selectedCourse!),
		enabled: Boolean(selectedCourse),
		select: timetableDataToTechnoCourses,
	});

	const handleCourseSelect = (course: ServerCourse) => {
		setSelectedCourse(course);
	};

	const handleGroupSelect = (technoCourse: TechnoCourse) => {
		const exists = selectedGroups.find(
			(sg) =>
				sg.internal.code === technoCourse.internal.code &&
				sg.internal.group === technoCourse.internal.group,
		);
		if (!exists) {
			CourseStore.getState().addCourse(technoCourse);
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
			<DialogStackHeader>
				<DialogStackTitle>Groups</DialogStackTitle>
				<DialogStackDescription>
					Select and manage your selected groups.
				</DialogStackDescription>
			</DialogStackHeader>

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
								courses.map((course) => (
									<button
										key={course.code}
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
							) : selectedCourse &&
								availableGroups &&
								availableGroups.length > 0 ? (
								availableGroups.map((technoCourse) => (
									<button
										key={technoCourse.internal.group}
										onClick={() => handleGroupSelect(technoCourse)}
										className="block w-full text-left p-2 rounded hover:bg-muted transition-colors"
										disabled={selectedGroups.some(
											(sg) =>
												sg.internal.code === technoCourse.internal.code &&
												sg.internal.group === technoCourse.internal.group,
										)}
									>
										<div className="text-sm">{technoCourse.internal.group}</div>
									</button>
								))
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
								{selectedGroups.map(({ internal: { code, group } }) => (
									<div
										key={`${code}-${group}`}
										className="border rounded-lg p-3 bg-muted/30"
									>
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

			<DialogStackFooter className="justify-start">
				<DialogStackPrevious asChild>
					<Button variant="outline">Previous</Button>
				</DialogStackPrevious>
			</DialogStackFooter>
		</>
	);
}

export default function TechnoUniversityImporterDialog({
	children,
}: {
	children: JSX.Element;
}) {
	const [selectedCampus, setSelectedCampus] = useState<
		ServerCampus | undefined
	>();
	const [selectedFaculty, setSelectedFaculty] = useState<
		ServerFaculty | undefined
	>();
	const [selectedCourse, setSelectedCourse] = useState<
		ServerCourse | undefined
	>();

	return (
		<DialogStack>
			<DialogStackTrigger asChild>{children}</DialogStackTrigger>
			<DialogStackOverlay />
			<ImporterSelectionContext.Provider
				value={{
					selectedCampus,
					setSelectedCampus: (c?: ServerCampus) => {
						setSelectedCampus(c);
						// Reset dependent selections when campus changes
						setSelectedFaculty(undefined);
						setSelectedCourse(undefined);
					},
					selectedFaculty,
					setSelectedFaculty: (f?: ServerFaculty) => {
						setSelectedFaculty(f);
						// Reset course selection when faculty changes
						setSelectedCourse(undefined);
					},
					selectedCourse,
					setSelectedCourse,
				}}
			>
				<DialogStackBody className="max-w-5xl">
					<DialogStackContent>
						<CourseAndFacultySelectorDialog />
					</DialogStackContent>
					<DialogStackContent>
						<GroupSelectorDialog />
					</DialogStackContent>
				</DialogStackBody>
			</ImporterSelectionContext.Provider>
		</DialogStack>
	);
}
