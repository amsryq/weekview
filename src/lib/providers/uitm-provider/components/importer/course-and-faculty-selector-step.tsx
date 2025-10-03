import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
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
import { Campus } from "../../models/campus";
import { Faculty } from "../../models/faculty";
import { useImporterSelectionStore } from "./shared";
import { UnaffiliationNotice } from "./unaffiliation-notice";

function CourseAndFacultySelectorStep({
	onOpenImport,
}: {
	onOpenImport: () => void;
}) {
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

			<DialogFooter className="justify-between">
				<Button
					variant="outline"
					onClick={onOpenImport}
					className="w-full sm:w-auto"
				>
					Paste from registration list
				</Button>
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

export { CourseAndFacultySelectorStep };
