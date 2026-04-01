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
import type { Campus } from "../../../../models/campus";
import type { Faculty } from "../../../../models/faculty";
import { getFriendlyUiTMErrorMessage } from "../../utils/error-feedback";

interface CampusFacultyEditorProps {
	campuses: Campus[] | undefined;
	faculties: Faculty[] | undefined;
	selectedCampus: Campus | undefined;
	selectedFaculty: Faculty | undefined;
	campusesLoading: boolean;
	facultiesLoading: boolean;
	campusesError: Error | null;
	facultiesError: Error | null;
	onCampusChange: (campusCode: string) => void;
	onFacultyChange: (facultyCode: string) => void;
}

export function CampusFacultyEditor({
	campuses,
	faculties,
	selectedCampus,
	selectedFaculty,
	campusesLoading,
	facultiesLoading,
	campusesError,
	facultiesError,
	onCampusChange,
	onFacultyChange,
}: CampusFacultyEditorProps) {
	return (
		<div className="space-y-3">
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
					onValueChange={onCampusChange}
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
					<p className="px-1 text-sm text-destructive">
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
						onValueChange={onFacultyChange}
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
						<p className="px-1 text-sm text-destructive">
							{getFriendlyUiTMErrorMessage(facultiesError)}
						</p>
					) : null}
				</div>
			) : null}
		</div>
	);
}
