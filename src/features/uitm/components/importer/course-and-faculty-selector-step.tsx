import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Compass } from "lucide-react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "~/components/ui/button";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "~/components/ui/responsive-dialog";
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
import { Campus } from "../../models/campus";
import { Faculty } from "../../models/faculty";
import { useImporterSelectionStore } from "./shared";

interface CourseAndFacultySelectorDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CourseAndFacultySelectorDialog({
	open,
	onOpenChange,
}: CourseAndFacultySelectorDialogProps) {
	const {
		selectedCampus,
		selectedFaculty,
		setSelectedCampus,
		setSelectedFaculty,
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

	const canProceed = useMemo(() => {
		if (!selectedCampus) return false;
		return selectedCampus.requireFaculty ? Boolean(selectedFaculty) : true;
	}, [selectedCampus, selectedFaculty]);

	const handleBack = () => setCurrentStep("source");
	const handleNext = () => setCurrentStep("group-selector");

	const handleCampusChange = (campusId: string) => {
		const campus = campuses?.find((c) => c.code === campusId);
		if (!campus) return;
		setSelectedCampus(campus);
	};

	const handleFacultyChange = (facultyId: string) => {
		const faculty = faculties?.find((f) => f.code === facultyId);
		if (!faculty) return;
		setSelectedFaculty(faculty);
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent
				desktopClassName="sm:max-w-xl"
				mobileClassName="max-h-[95vh]"
			>
				<ResponsiveDialogHeader className="gap-1">
					<ResponsiveDialogTitle className="flex items-center gap-2 text-lg">
						<span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Compass className="size-4" />
						</span>
						Choose your campus & faculty
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Select where you study so we can show the exact courses available to
						you.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<div className="flex-1 space-y-5 px-6 overflow-y-auto min-h-0">
					<section className="space-y-2">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium text-muted-foreground">
								Campus
							</h3>
							{campusesLoading && (
								<span className="text-xs text-muted-foreground">Loading…</span>
							)}
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
							<p className="text-sm text-destructive">
								{campusesError.message}
							</p>
						) : null}
					</section>

					{selectedCampus?.requireFaculty ? (
						<section className="space-y-2">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-muted-foreground">
									Faculty
								</h3>
								{facultiesLoading && (
									<span className="text-xs text-muted-foreground">
										Loading…
									</span>
								)}
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
								<p className="text-sm text-destructive">
									{(facultiesError as Error).message}
								</p>
							) : null}
						</section>
					) : null}

					<p className="text-xs text-muted-foreground pb-6">
						Your selections help narrow down the exact course catalogue. You can
						change them later if needed.
					</p>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:justify-between border-t p-6 mt-auto">
					<Button
						variant="ghost"
						className="w-full sm:w-auto"
						onClick={handleBack}
					>
						<ArrowLeft className="size-4" />
						Back
					</Button>
					<Button
						variant="default"
						className="w-full sm:w-auto"
						disabled={!canProceed}
						onClick={handleNext}
					>
						Continue to groups
					</Button>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}

function pickSelectorState(
	state: ReturnType<typeof useImporterSelectionStore.getState>,
) {
	return {
		selectedCampus: state.selectedCampus,
		selectedFaculty: state.selectedFaculty,
		setSelectedCampus: state.setSelectedCampus,
		setSelectedFaculty: state.setSelectedFaculty,
		setCurrentStep: state.setCurrentStep,
	};
}
