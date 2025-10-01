import { useQuery } from "@tanstack/react-query";
import { pick } from "es-toolkit";
import {
	AlertTriangleIcon,
	PlusIcon,
	SearchIcon,
	Trash2Icon,
} from "lucide-react";
import { JSX, useEffect, useState } from "react";
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
import { Input } from "~/components/ui/input";
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
import { MeetingTime } from "~/lib/models/meeting-time";
import { CourseStore } from "~/lib/stores/course-store";
import { UiTMGroup } from "../group";
import { Campus } from "../models/campus";
import { Course } from "../models/course";
import { Faculty } from "../models/faculty";
import { Group } from "../models/group";

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

const SHORT_DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function summarizeMeetingTimes(meetingTimes: MeetingTime[]): string {
	return meetingTimes
		.map((meeting) => {
			const day = SHORT_DAY_NAMES[(meeting.day - 1 + 7) % 7] ?? "";
			const timeRange = `${meeting.time.start.toString()}-${meeting.time.end.toString()}`;
			return `${day} ${timeRange}`.trim();
		})
		.join(" • ");
}

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
					modal={true}
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
									<ComboboxItem key={idx} value={code} keywords={[name]}>
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
						modal={true}
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
										<ComboboxItem key={idx} value={id} keywords={[name]}>
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

	const [searchQuery, setSearchQuery] = useState("");

	const selectedGroups = useStore(
		CourseStore,
		useShallow((state) =>
			state.courses.filter((a): a is UiTMGroup => a instanceof UiTMGroup),
		),
	);
	// Courses list for selected campus/faculty
	const {
		data: courses,
		isLoading: coursesLoading,
		error: coursesError,
	} = useQuery<Course[]>({
		queryKey: ["uitm", "courses", selectedCampus?.code, selectedFaculty?.code],
		queryFn: () => Course.fetch(selectedFaculty ?? selectedCampus!),
		enabled: Boolean(selectedFaculty || selectedCampus),
		staleTime: 5 * 60 * 1000,
	});

	// Groups for selected course
	const {
		data: availableGroups,
		isLoading: groupsLoading,
		error: groupsError,
	} = useQuery<Group[], Error, UiTMGroup[]>({
		queryKey: ["uitm", "groups", selectedCourse?.code],
		queryFn: () => Group.fetch(selectedCourse!),
		enabled: Boolean(selectedCourse),
		select: (groups) => groups.map((g) => g.toUiTMCourse()),
	});

	const filteredGroups = availableGroups?.filter((group) => {
		const query = searchQuery.toLowerCase();
		const groupName = group.internal.group.toLowerCase();
		const meetingSummary = summarizeMeetingTimes(
			group.meetingTimes,
		).toLowerCase();
		return groupName.includes(query) || meetingSummary.includes(query);
	});

	const handleCourseSelect = (course: Course | undefined) => {
		setSelectedCourse(course);
	};

	const handleCourseChange = (courseCode: string) => {
		if (!courseCode) {
			handleCourseSelect(undefined);
			return;
		}

		const course = courses?.find((c) => c.code === courseCode);
		if (course) {
			handleCourseSelect(course);
		}
	};

	const handleGroupSelect = (uitmCourse: UiTMGroup) => {
		const exists = selectedGroups.find(
			(sg) =>
				sg.internal.code === uitmCourse.internal.code &&
				sg.internal.group === uitmCourse.internal.group,
		);

		if (!exists) {
			const state = CourseStore.getState();
			if (state.getConflictingCourses(uitmCourse.meetingTimes).length === 0) {
				state.addCourse(uitmCourse);
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
						<Combobox
							type="course"
							modal={true}
							loading={coursesLoading}
							loadingText="Loading courses..."
							data={
								courses?.map((course) => ({
									value: course.code,
									label: course.code,
								})) || []
							}
							value={selectedCourse?.code || ""}
							onValueChange={handleCourseChange}
						>
							<ComboboxTrigger
								className={`w-full ${coursesLoading ? "cursor-wait" : ""}`}
								disabled={coursesLoading || !courses?.length}
							/>
							<ComboboxContent>
								<ComboboxInput />
								<ComboboxEmpty>
									{coursesLoading
										? "Loading courses..."
										: "No courses available"}
								</ComboboxEmpty>
								<ComboboxList>
									<ComboboxGroup>
										{courses?.map((course, idx) => (
											<ComboboxItem
												key={idx}
												value={course.code}
												keywords={[course.code]}
											>
												{course.code}
											</ComboboxItem>
										))}
									</ComboboxGroup>
								</ComboboxList>
							</ComboboxContent>
						</Combobox>

						{coursesError && (
							<div className="text-sm text-red-500">{coursesError.message}</div>
						)}
					</div>

					{/* Groups Section */}
					<div className="flex flex-col gap-2 h-full min-h-0">
						<h3 className="text-center font-medium">Groups</h3>
						<div className="border rounded-lg pS-3 h-full overflow-y-auto bg-muted/30">
							<div className="relative m-2">
								<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									placeholder="Search groups..."
									disabled={!selectedCourse || availableGroups?.length === 0}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							{groupsError ? (
								<div className="text-center text-sm text-destructive p-2">
									{(groupsError as Error).message}
								</div>
							) : groupsLoading ? (
								<div className="text-center text-sm text-muted-foreground italic p-2">
									Loading groups...
								</div>
							) : selectedCourse && filteredGroups?.length ? (
								filteredGroups.map((uitmCourse, idx) => {
									const alreadyExists = selectedGroups.some(
										(sg) =>
											sg.internal.code === uitmCourse.internal.code &&
											sg.internal.group === uitmCourse.internal.group,
									);
									const conflicts =
										CourseStore.getState().getConflictingCourses(
											uitmCourse.meetingTimes,
										);

									const reason = alreadyExists
										? "Already added"
										: conflicts.length > 0
											? "Time conflict with " +
												conflicts.map((c) => c.code).join(", ")
											: undefined;

									const summary = summarizeMeetingTimes(
										uitmCourse.meetingTimes,
									);

									return (
										<div
											key={idx}
											className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-colors ${
												reason ? "opacity-60" : ""
											}`}
										>
											<div className="flex min-w-0 flex-1 flex-col gap-1">
												<div className="flex items-center justify-between gap-2">
													<span className="text-sm font-medium">
														{uitmCourse.internal.group}
													</span>
													{reason && (
														<span className="text-xs text-muted-foreground">
															{reason}
														</span>
													)}
												</div>
												<span className="text-xs text-muted-foreground truncate">
													{summary}
												</span>
											</div>
											<Button
												variant="outline"
												size="icon"
												className="size-8"
												onClick={() => handleGroupSelect(uitmCourse)}
												disabled={Boolean(reason)}
												title={reason ?? summary}
											>
												<span className="sr-only">Add</span>
												<PlusIcon className="size-4 shrink-0" />
											</Button>
										</div>
									);
								})
							) : (
								<div className="text-center text-sm text-muted-foreground italic p-2">
									{selectedCourse
										? "No groups available"
										: "Select a course to view groups"}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right side - Selected Groups */}
				<div className="flex flex-col gap-2 w-1/3">
					<div className="border rounded-lg p-3 h-full overflow-y-auto">
						{selectedGroups.length > 0 ? (
							<div className="space-y-2">
								{selectedGroups.map(({ internal: { code, group } }, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3"
									>
										<div className="min-w-0">
											<div className="text-sm font-medium">{code}</div>
											<div className="text-xs text-muted-foreground truncate">
												{group}
											</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="size-8"
											title="Remove"
											onClick={() => handleGroupRemove(code, group)}
										>
											<Trash2Icon className="size-4" />
											<span className="sr-only">Remove</span>
										</Button>
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

export default function UiTMImporterDialog({
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
				<DialogContent className={`sm:max-w-4xl w-auto`}>
					<CourseAndFacultySelectorStep />
				</DialogContent>
			</Dialog>
			<Dialog open={open && currentStep === 1} onOpenChange={handleOpenChange}>
				<DialogContent className="sm:max-w-4xl w-full">
					<GroupSelectorStep />
				</DialogContent>
			</Dialog>
		</>
	);
}
