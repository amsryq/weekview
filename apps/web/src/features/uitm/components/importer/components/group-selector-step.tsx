import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	PencilLine,
	PlusIcon,
	SearchIcon,
	Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "~/components/ui/responsive-dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
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
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import { CourseStore } from "~/lib/stores/course-store";
import { cn } from "~/lib/utils/styles";
import { UiTMCourseSection } from "../../../course-section";
import { Campus } from "../../../models/campus";
import { Faculty } from "../../../models/faculty";
import { useGroupFiltering } from "../hooks/use-group-filtering";
import { useGroupQueries } from "../hooks/use-group-queries";
import { getFriendlyUiTMErrorMessage } from "../utils/error-feedback";
import { useImporterSelectionStore } from "../utils/shared";

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

export function GroupSelectorStep() {
	const [searchQuery, setSearchQuery] = useState("");
	const [courseSearchQuery, setCourseSearchQuery] = useState("");
	const [selectionSheetOpen, setSelectionSheetOpen] = useState(false);
	const [editingCampusFaculty, setEditingCampusFaculty] = useState(false);

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

	const canSelectCourse =
		Boolean(selectedCampus) &&
		(selectedCampus?.requireFaculty ? Boolean(selectedFaculty) : true);

	const showCampusFacultyEditor = !canSelectCourse || editingCampusFaculty;

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

	const selectedGroups = useStore(
		CourseStore,
		useShallow((state) =>
			state.courses.filter(
				(course): course is UiTMCourseSection =>
					course instanceof UiTMCourseSection,
			),
		),
	);

	const selectionCount = selectedGroups.length;

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

	const filteredCourses = useMemo(() => {
		const query = courseSearchQuery.trim().toLowerCase();
		if (!query) return courses ?? [];
		return (courses ?? []).filter((course) =>
			course.code.toLowerCase().includes(query),
		);
	}, [courseSearchQuery, courses]);

	const campusFacultySection = (
		<section className="space-y-2">
			<div className="flex items-center justify-between px-1">
				<h3 className="text-xs font-bold text-muted-foreground/80">
					Campus & Faculty
				</h3>
				{showCampusFacultyEditor ? null : (
					<Button
						variant="secondary"
						size="sm"
						className="h-7 gap-1.5 px-2.5 text-[11px]"
						onClick={() => setEditingCampusFaculty(true)}
					>
						<PencilLine className="size-3" />
						Change
					</Button>
				)}
			</div>
			{showCampusFacultyEditor ? (
				<div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3">
					<div className="space-y-2">
						<div className="flex items-center justify-between px-1">
							<h4 className="text-[11px] font-bold text-muted-foreground/80">
								Campus
							</h4>
							{campusesLoading ? (
								<span className="text-[10px] font-medium text-muted-foreground">
									Loading…
								</span>
							) : null}
						</div>
						<Combobox
							type="campus"
							modal
							loading={campusesLoading}
							loadingText="Loading campuses…"
							data={
								campuses?.map((campus) => ({
									value: campus.code,
									label: campus.name,
								})) ?? []
							}
							value={selectedCampus?.code ?? ""}
							onValueChange={handleCampusChange}
						>
							<ComboboxTrigger
								className="w-full"
								disabled={campusesLoading || !campuses?.length}
							/>
							<ComboboxContent className="max-h-60">
								<ComboboxInput placeholder="Search campuses…" />
								<ComboboxEmpty>
									{campusesLoading ? "Loading campuses…" : "No campuses found"}
								</ComboboxEmpty>
								<ComboboxList>
									<ComboboxGroup>
										{campuses?.map((campus) => (
											<ComboboxItem
												key={campus.code}
												value={campus.code}
												keywords={[campus.name]}
											>
												{campus.name}
											</ComboboxItem>
										))}
									</ComboboxGroup>
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						{campusesError ? (
							<p className="text-sm text-destructive px-1">
								{getFriendlyUiTMErrorMessage(campusesError)}
							</p>
						) : null}
					</div>

					{selectedCampus?.requireFaculty ? (
						<div className="space-y-2">
							<div className="flex items-center justify-between px-1">
								<h4 className="text-[11px] font-bold text-muted-foreground/80">
									Faculty
								</h4>
								{facultiesLoading ? (
									<span className="text-[10px] font-medium text-muted-foreground">
										Loading…
									</span>
								) : null}
							</div>
							<Combobox
								type="faculty"
								modal
								loading={facultiesLoading}
								loadingText="Loading faculties…"
								data={
									faculties?.map((faculty) => ({
										value: faculty.code,
										label: faculty.name,
									})) ?? []
								}
								value={selectedFaculty?.code ?? ""}
								onValueChange={handleFacultyChange}
							>
								<ComboboxTrigger
									className="w-full"
									disabled={facultiesLoading || !faculties?.length}
								/>
								<ComboboxContent className="max-h-60">
									<ComboboxInput placeholder="Search faculties…" />
									<ComboboxEmpty>
										{facultiesLoading
											? "Loading faculties…"
											: "No faculties for this campus"}
									</ComboboxEmpty>
									<ComboboxList>
										<ComboboxGroup>
											{faculties?.map((faculty) => (
												<ComboboxItem
													key={faculty.code}
													value={faculty.code}
													keywords={[faculty.name]}
												>
													{faculty.name}
												</ComboboxItem>
											))}
										</ComboboxGroup>
									</ComboboxList>
								</ComboboxContent>
							</Combobox>
							{facultiesError ? (
								<p className="text-sm text-destructive px-1">
									{getFriendlyUiTMErrorMessage(facultiesError)}
								</p>
							) : null}
						</div>
					) : null}
				</div>
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

	const mobileCoursePicker = (
		<section className="space-y-2 md:hidden">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
				<h3 className="text-xs font-bold text-muted-foreground/80">Course</h3>
			</div>
			<Combobox
				type="course"
				modal
				loading={coursesLoading}
				loadingText="Loading courses…"
				data={
					courses?.map((course) => ({
						value: course.code,
						label: course.code,
					})) ?? []
				}
				value={selectedCourse?.code ?? ""}
				onValueChange={handleCourseChange}
			>
				<ComboboxTrigger
					className="w-full"
					disabled={coursesLoading || !courses?.length}
				/>
				<ComboboxContent className="max-h-64">
					<ComboboxInput placeholder="Search courses…" />
					<ComboboxEmpty>
						{coursesLoading ? "Loading courses…" : "No courses found"}
					</ComboboxEmpty>
					<ComboboxList>
						<ComboboxGroup>
							{courses?.map((course) => (
								<ComboboxItem
									key={course.code}
									value={course.code}
									keywords={[course.code]}
								>
									<span className="text-sm font-medium">{course.code}</span>
								</ComboboxItem>
							))}
						</ComboboxGroup>
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			{coursesError ? (
				<p className="text-sm text-destructive px-1">
					{getFriendlyUiTMErrorMessage(coursesError)}
				</p>
			) : null}
		</section>
	);

	const desktopCoursePicker = (
		<section className="hidden flex-1 min-h-0 overflow-hidden rounded-xl border border-border/60 bg-card md:flex md:flex-col">
			<div className="border-b border-border/60 p-3">
				<h3 className="px-1 text-xs font-bold text-muted-foreground/80">
					Courses
				</h3>
				<div className="relative mt-2">
					<SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="h-8 pl-8 text-xs focus-visible:ring-1"
						placeholder="Search courses"
						value={courseSearchQuery}
						onChange={(event) => setCourseSearchQuery(event.target.value)}
						disabled={coursesLoading || !courses?.length}
					/>
				</div>
			</div>
			<ScrollArea className="flex-1 min-h-0 bg-background/50">
				<div className="divide-y divide-border/60 text-left">
					{coursesError ? (
						<div className="p-4 text-sm text-destructive">
							{getFriendlyUiTMErrorMessage(coursesError)}
						</div>
					) : coursesLoading ? (
						Array.from({ length: 6 }).map((_, index) => (
							<div key={index} className="px-3 py-2.5">
								<div className="h-7 w-full animate-pulse rounded bg-muted/60" />
							</div>
						))
					) : filteredCourses.length ? (
						filteredCourses.map((course) => {
							const isSelected = selectedCourse?.code === course.code;
							return (
								<button
									key={course.code}
									type="button"
									onClick={() => handleCourseChange(course.code)}
									className={cn(
										"flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors",
										isSelected
											? "bg-primary/10 text-primary"
											: "hover:bg-primary/5",
									)}
								>
									<span className="text-sm font-semibold">{course.code}</span>
									{isSelected ? (
										<span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
											Selected
										</span>
									) : null}
								</button>
							);
						})
					) : (
						<div className="p-4 text-sm text-muted-foreground">
							{courseSearchQuery
								? "No courses match your search."
								: "No courses found."}
						</div>
					)}
				</div>
			</ScrollArea>
		</section>
	);

	return (
		<>
			<ResponsiveDialogHeader className="gap-1 px-6 pt-6">
				<ResponsiveDialogTitle>Choose your groups</ResponsiveDialogTitle>
				<ResponsiveDialogDescription>
					Select campus details, then pick a course and add groups.
				</ResponsiveDialogDescription>
			</ResponsiveDialogHeader>

			<div className="min-h-0 flex-1 overflow-y-auto md:overflow-hidden px-6 py-4">
				{canSelectCourse ? (
					<div className="space-y-4 pt-2 md:flex md:items-start md:gap-4 md:space-y-0">
						<div className="shrink-0 space-y-4 md:flex md:h-[480px] md:w-[240px] md:flex-col lg:w-[280px]">
							{campusFacultySection}
							{mobileCoursePicker}
							{desktopCoursePicker}
						</div>

						<section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card md:h-[480px] lg:w-[600px] xl:w-[800px]">
							<div className="flex flex-col gap-3 border-b border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-3">
									<h3 className="px-1 text-xs font-bold text-muted-foreground/80">
										Available groups
									</h3>
									<Sheet
										open={selectionSheetOpen}
										onOpenChange={setSelectionSheetOpen}
									>
										<SheetTrigger asChild>
											<Button
												variant="secondary"
												size="sm"
												className="h-7 gap-2 px-2 text-[10px]"
											>
												Selected
												<span className="flex size-4 items-center justify-center rounded-sm bg-primary text-[10px] font-bold text-primary-foreground">
													{selectionCount}
												</span>
											</Button>
										</SheetTrigger>
										<SheetContent
											side="bottom"
											className="max-h-[80dvh] overflow-hidden rounded-t-2xl border border-border/60 pb-4 sm:max-w-xl"
										>
											<SheetHeader className="px-6 pt-6 text-left">
												<SheetTitle>Selected groups</SheetTitle>
												<SheetDescription>
													View and manage the groups you&apos;ve added.
												</SheetDescription>
											</SheetHeader>
											<ScrollArea className="my-4 h-[40dvh] rounded-lg border border-border/50 bg-background mx-6 sm:h-[260px]">
												<div className="divide-y divide-border/40 px-3">
													{selectionCount ? (
														selectedGroups.map(({ internal }) => (
															<div
																key={`${internal.code}-${internal.group}`}
																className="flex items-center justify-between gap-3 py-2"
															>
																<div className="min-w-0">
																	<p className="text-sm font-medium text-foreground">
																		{internal.code}
																	</p>
																	<p className="text-xs text-muted-foreground">
																		{internal.group}
																	</p>
																</div>
																<Button
																	variant="ghost"
																	size="icon"
																	className="size-7"
																	onClick={() =>
																		handleGroupRemove(
																			internal.code,
																			internal.group,
																		)
																	}
																>
																	<Trash2Icon className="size-3.5" />
																	<span className="sr-only">Remove</span>
																</Button>
															</div>
														))
													) : (
														<p className="p-3 text-sm text-muted-foreground">
															No groups added yet.
														</p>
													)}
												</div>
											</ScrollArea>
											<div className="mx-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
												<SheetClose asChild>
													<Button
														variant="secondary"
														size="sm"
														className="w-full sm:w-auto"
													>
														Close
													</Button>
												</SheetClose>
											</div>
										</SheetContent>
									</Sheet>
								</div>
								<div className="relative w-full sm:w-64">
									<SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
									<Input
										className="h-8 pl-8 text-xs focus-visible:ring-1"
										placeholder="Search or filter"
										value={searchQuery}
										onChange={(event) => setSearchQuery(event.target.value)}
										disabled={!selectedCourse || groupsLoading}
									/>
								</div>
							</div>

							<ScrollArea className="h-[280px] md:h-auto md:flex-1 bg-background/50">
								<div className="divide-y divide-border/60 text-left">
									{groupsError ? (
										<div className="p-4 text-sm text-destructive">
											{getFriendlyUiTMErrorMessage(groupsError)}
										</div>
									) : groupsLoading ? (
										Array.from({ length: 6 }).map((_, index) => (
											<div
												key={index}
												className="flex animate-pulse items-center gap-4 px-4 py-2.5"
											>
												<div className="h-6 w-16 rounded bg-muted/60" />
												<div className="h-2.5 flex-1 rounded bg-muted/60" />
											</div>
										))
									) : filteredGroups.length ? (
										filteredGroups.map((uitmCourse) => {
											const { internal } = uitmCourse;
											const key = `${internal.code}-${internal.group}`;
											const conflictCodes = groupConflicts.get(key);
											const alreadyAdded = selectedGroupKeys.has(key);
											const disabled = alreadyAdded || Boolean(conflictCodes);
											const reason = alreadyAdded
												? "Added"
												: conflictCodes
													? `Conflict: ${conflictCodes.join(", ")}`
													: undefined;
											const summary = groupSummaries.get(key) ?? "";
											return (
												<div
													key={key}
													className="group flex items-center justify-between gap-4 overflow-hidden px-4 py-2.5 transition-colors hover:bg-primary/5"
												>
													<div className="flex min-w-0 flex-1 flex-col gap-0.5">
														<div className="flex items-center gap-2">
															<span className="text-sm font-semibold text-foreground">
																{internal.group}
															</span>
															{reason ? (
																<span
																	className={cn(
																		"text-[10px] font-medium shrink-0",
																		alreadyAdded
																			? "text-primary"
																			: "text-destructive",
																	)}
																>
																	{reason}
																</span>
															) : null}
														</div>
														<span className="truncate text-[11px] text-muted-foreground">
															{summary}
														</span>
													</div>
													<Button
														variant={alreadyAdded ? "secondary" : "default"}
														size="sm"
														className="h-7 gap-1 px-2.5 text-xs"
														disabled={disabled}
														title={reason ?? "Add group"}
														onClick={() => handleGroupSelect(uitmCourse)}
													>
														<PlusIcon className="size-3" />
														Add
													</Button>
												</div>
											);
										})
									) : (
										<div className="p-10 text-center text-sm text-muted-foreground">
											{selectedCourse
												? "No groups match your search."
												: "Select a course to browse its groups."}
										</div>
									)}
								</div>
							</ScrollArea>
						</section>
					</div>
				) : (
					<div className="space-y-4 pt-2">
						{campusFacultySection}
						<div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
							Select your campus and faculty details to load available courses
							and groups.
						</div>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:justify-between p-6 mt-auto">
				<Button
					variant="ghost"
					size="sm"
					className="w-full sm:w-auto"
					onClick={handleBack}
				>
					<ArrowLeft className="size-4 mr-2" />
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
