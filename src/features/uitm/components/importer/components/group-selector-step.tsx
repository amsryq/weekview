import {
	ArrowLeft,
	Layers,
	PlusIcon,
	SearchIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
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
import { UiTMCourseSection } from "../../../course-section";
import { useGroupFiltering } from "../hooks/use-group-filtering";
import { useGroupQueries } from "../hooks/use-group-queries";
import { useImporterSelectionStore } from "../utils/shared";

interface GroupSelectorDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function pickSelectorState(
	state: ReturnType<typeof useImporterSelectionStore.getState>,
) {
	return {
		selectedCampus: state.selectedCampus,
		selectedFaculty: state.selectedFaculty,
		selectedCourse: state.selectedCourse,
		setSelectedCourse: state.setSelectedCourse,
		setCurrentStep: state.setCurrentStep,
	};
}

export function GroupSelectorDialog({
	open,
	onOpenChange,
}: GroupSelectorDialogProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectionSheetOpen, setSelectionSheetOpen] = useState(false);

	const {
		selectedCampus,
		selectedFaculty,
		selectedCourse,
		setSelectedCourse,
		setCurrentStep,
	} = useImporterSelectionStore(
		useShallow((state) => pickSelectorState(state)),
	);

	const {
		courses,
		coursesLoading,
		coursesError,
		availableGroups,
		groupsLoading,
		groupsError,
	} = useGroupQueries(selectedCampus, selectedFaculty, selectedCourse);

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

	const handleBack = () => setCurrentStep("campus-faculty");

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent
				desktopClassName="sm:max-w-4xl"
				mobileClassName="max-h-[95dvh]"
			>
				<ResponsiveDialogHeader className="gap-1">
					<ResponsiveDialogTitle className="flex items-center gap-2 text-lg">
						<span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Layers className="size-4" />
						</span>
						Choose your groups
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Pick a course, explore the available groups, and add the ones that
						fit your timetable.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<div className="flex-1 space-y-6 px-6 overflow-y-auto min-h-0">
					<section className="space-y-2">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<h3 className="text-sm font-medium text-muted-foreground">
								Course
							</h3>
							{selectedCampus ? (
								<span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground w-fit">
									{selectedCampus.name}
									{selectedFaculty ? ` • ${selectedFaculty.name}` : ""}
								</span>
							) : null}
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
												<div className="flex flex-col">
													<span className="text-sm font-medium">
														{course.code}
													</span>
												</div>
											</ComboboxItem>
										))}
									</ComboboxGroup>
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						{coursesError ? (
							<p className="text-sm text-destructive">{coursesError.message}</p>
						) : null}
					</section>

					<section className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center justify-between gap-2">
								<h3 className="text-sm font-medium text-muted-foreground">
									Available groups
								</h3>
								<Sheet
									open={selectionSheetOpen}
									onOpenChange={setSelectionSheetOpen}
								>
									<SheetTrigger asChild>
										<Button
											variant="secondary"
											className="w-fit justify-between gap-3 px-3 py-2 text-sm"
										>
											<span className="font-medium">Selected groups</span>
											<span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
												{selectionCount}
											</span>
										</Button>
									</SheetTrigger>
									<SheetContent
										side="bottom"
										className="max-h-[80dvh] pb-4 overflow-hidden border border-border/60 rounded-t-2xl sm:max-w-xl"
									>
										<SheetHeader className="px-6 pt-6 text-left">
											<SheetTitle>Selected groups</SheetTitle>
											<SheetDescription>
												Organise the groups you&apos;ve added to your timetable.
											</SheetDescription>
										</SheetHeader>
										<ScrollArea className="mx-6 h-[40dvh] sm:h-[260px] rounded-lg border border-border/50 bg-background my-4">
											<div className="space-y-2 p-3">
												{selectionCount ? (
													selectedGroups.map(({ internal }) => (
														<div
															key={`${internal.code}-${internal.group}`}
															className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
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
																className="size-8"
																onClick={() =>
																	handleGroupRemove(
																		internal.code,
																		internal.group,
																	)
																}
															>
																<Trash2Icon className="size-4" />
																<span className="sr-only">Remove</span>
															</Button>
														</div>
													))
												) : (
													<p className="text-sm text-muted-foreground">
														No groups added yet.
													</p>
												)}
											</div>
										</ScrollArea>
										<div className="mx-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
											<SheetClose asChild>
												<Button
													variant="secondary"
													className="w-full sm:w-auto"
												>
													Close
												</Button>
											</SheetClose>
										</div>
									</SheetContent>
								</Sheet>
							</div>
							<div className="relative w-full sm:w-80">
								<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="pl-9"
									placeholder="Search or filter"
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									disabled={!selectedCourse || groupsLoading}
								/>
							</div>
						</div>

						<ScrollArea className="h-[320px] rounded-lg border bg-background">
							<div className="divide-y text-left">
								{groupsError ? (
									<div className="p-4 text-sm text-destructive">
										{groupsError.message}
									</div>
								) : groupsLoading ? (
									Array.from({ length: 6 }).map((_, index) => (
										<div
											key={index}
											className="flex animate-pulse items-center gap-4 px-4 py-3"
										>
											<div className="h-8 w-24 rounded bg-muted" />
											<div className="h-3 flex-1 rounded bg-muted" />
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
											? "Already in timetable"
											: conflictCodes
												? `Conflicts with ${conflictCodes.join(", ")}`
												: undefined;
										const summary = groupSummaries.get(key) ?? "";
										return (
											<div
												key={key}
												className="group flex items-center justify-between gap-4 overflow-hidden px-4 py-3 transition-colors hover:bg-muted/30"
											>
												<div className="flex min-w-0 flex-1 flex-col gap-1">
													<div className="flex items-center gap-2">
														<span className="text-sm font-semibold text-foreground">
															{internal.group}
														</span>
														{reason ? (
															<span className="text-xs text-muted-foreground">
																{reason}
															</span>
														) : null}
													</div>
													<span className="text-xs text-muted-foreground">
														{summary}
													</span>
												</div>
												<Button
													variant="default"
													size="sm"
													className="gap-2"
													disabled={disabled}
													title={reason ?? "Add group"}
													onClick={() => handleGroupSelect(uitmCourse)}
												>
													<PlusIcon className="size-4" />
													Add
												</Button>
											</div>
										);
									})
								) : (
									<div className="p-6 text-center text-sm text-muted-foreground">
										{selectedCourse
											? "No groups match your search."
											: "Select a course to browse its groups."}
									</div>
								)}
							</div>
						</ScrollArea>
					</section>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:justify-between border-t p-6 mt-auto">
					<Button
						variant="ghost"
						className="w-full sm:w-auto"
						onClick={handleBack}
					>
						<ArrowLeft className="size-4" />
						Back to campus selection
					</Button>
					<Button
						variant="default"
						className="w-full sm:w-auto"
						onClick={() => setCurrentStep("source")}
					>
						Done adding groups
					</Button>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
