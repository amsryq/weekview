import { type JSX } from "react";
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
import { TechnoImporterStore } from "./importer-store";
import {
	campuses,
	faculties,
	getMockCourseObject,
	mockCourses,
	mockGroups,
} from "./mock-data";
import { TechnoCourse } from "./techno-course";

function CourseAndFacultySelectorDialog() {
	const { selectedCampus, selectedFaculty } = useStore(
		TechnoImporterStore,
		useShallow((s) => ({
			selectedCampus: s.selectedCampus,
			selectedFaculty: s.selectedFaculty,
		})),
	);

	const { update } = useStore(
		TechnoImporterStore,
		useShallow((s) => ({
			update: s.update,
		})),
	);

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
					data={campuses.map(({ id, name }) => ({ value: id, label: name }))}
					value={selectedCampus.id}
					onValueChange={(v) =>
						update({ selectedCampus: campuses.find((c) => c.id === v) })
					}
				>
					<ComboboxTrigger className="w-full" />
					<ComboboxContent>
						<ComboboxInput />
						<ComboboxEmpty />
						<ComboboxList>
							<ComboboxGroup>
								{campuses.map(({ id, name }) => (
									<ComboboxItem key={id} value={id}>
										{name}
									</ComboboxItem>
								))}
							</ComboboxGroup>
						</ComboboxList>
					</ComboboxContent>
				</Combobox>

				<Combobox
					type="faculty"
					data={faculties[selectedCampus.id]?.map(({ id, name }) => ({
						value: id,
						label: name,
					}))}
					value={selectedFaculty?.id || ""}
					onValueChange={(v) =>
						update({
							selectedFaculty: faculties[selectedCampus.id].find(
								(f) => f.id === v,
							),
						})
					}
				>
					<ComboboxTrigger
						className={`w-full ${faculties[selectedCampus.id] ? "" : "cursor-not-allowed opacity-50"}`}
						disabled={!faculties[selectedCampus.id]}
					/>
					<ComboboxContent>
						<ComboboxInput />
						<ComboboxEmpty />
						<ComboboxList>
							<ComboboxGroup>
								{faculties[selectedCampus.id]?.map(({ id, name }) => (
									<ComboboxItem key={id} value={id}>
										{name}
									</ComboboxItem>
								))}
							</ComboboxGroup>
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</div>

			<DialogStackFooter className="justify-end">
				<DialogStackNext asChild>
					<Button
						variant="outline"
						disabled={selectedCampus.requiresFaculty ? !selectedFaculty : false}
					>
						Next
					</Button>
				</DialogStackNext>
			</DialogStackFooter>
		</>
	);
}

function GroupSelectorDialog() {
	const { selectedCourse, update } = useStore(
		TechnoImporterStore,
		useShallow((s) => ({
			selectedCourse: s.selectedCourse,
			update: s.update,
		})),
	);
	const selectedGroups = useStore(
		CourseStore,
		useShallow((state) =>
			state.courses.filter((a): a is TechnoCourse => a instanceof TechnoCourse),
		),
	);

	const handleGroupSelect = (course: string, group: string) => {
		const exists = selectedGroups.find(
			(sg) => sg.initialCode === course && sg.group === group,
		);
		if (!exists) {
			CourseStore.getState().addCourse(getMockCourseObject(course, group));
		}
	};

	const handleGroupRemove = (course: string, group: string) => {
		const id = selectedGroups.find(
			(sg) => sg.initialCode === course && sg.group === group,
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
							{mockCourses.map((course) => (
								<button
									key={course.code}
									onClick={() => update({ selectedCourse: course.code })}
									className={`block w-full text-left p-2 rounded hover:bg-muted transition-colors ${
										selectedCourse === course.code ? "bg-muted" : ""
									}`}
								>
									<div className="text-sm">{course.code}</div>
								</button>
							))}
						</div>
					</div>

					{/* Groups Section */}
					<div className="flex flex-col gap-2">
						<h3 className="text-center font-medium">Groups</h3>
						<div className="border rounded-lg p-3 h-32 overflow-y-auto bg-muted/30">
							{selectedCourse && mockGroups[selectedCourse] ? (
								mockGroups[selectedCourse].map((group) => (
									<button
										key={group}
										onClick={() => handleGroupSelect(selectedCourse, group)}
										className="block w-full text-left p-2 rounded hover:bg-muted transition-colors"
										disabled={selectedGroups.some(
											(sg) =>
												sg.initialCode === selectedCourse && sg.group === group,
										)}
									>
										<div className="text-sm">{group}</div>
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
								{selectedGroups.map(({ initialCode: code, group }) => (
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
	return (
		<DialogStack>
			<DialogStackTrigger asChild>{children}</DialogStackTrigger>
			<DialogStackOverlay />
			<DialogStackBody className="max-w-5xl">
				<DialogStackContent>
					<CourseAndFacultySelectorDialog />
				</DialogStackContent>
				<DialogStackContent>
					<GroupSelectorDialog />
				</DialogStackContent>
			</DialogStackBody>
		</DialogStack>
	);
}
