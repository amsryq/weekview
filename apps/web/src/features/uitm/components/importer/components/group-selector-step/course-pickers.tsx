import { SearchIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
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
import { cn } from "~/lib/utils/styles";
import type { Course } from "../../../../models/course";
import { getFriendlyUiTMErrorMessage } from "../../utils/error-feedback";

interface MobileCoursePickerProps {
	courses: Course[] | undefined;
	selectedCourseCode: string | undefined;
	coursesLoading: boolean;
	coursesError: Error | null;
	onCourseChange: (courseCode: string) => void;
}

export function MobileCoursePicker({
	courses,
	selectedCourseCode,
	coursesLoading,
	coursesError,
	onCourseChange,
}: MobileCoursePickerProps) {
	return (
		<section className="space-y-2 lg:hidden">
			<div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
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
				value={selectedCourseCode ?? ""}
				onValueChange={onCourseChange}
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
				<p className="px-1 text-sm text-destructive">
					{getFriendlyUiTMErrorMessage(coursesError)}
				</p>
			) : null}
		</section>
	);
}

interface DesktopCoursePickerProps {
	courses: Course[] | undefined;
	filteredCourses: Course[];
	selectedCourseCode: string | undefined;
	coursesLoading: boolean;
	coursesError: Error | null;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onCourseChange: (courseCode: string) => void;
}

export function DesktopCoursePicker({
	courses,
	filteredCourses,
	selectedCourseCode,
	coursesLoading,
	coursesError,
	searchQuery,
	onSearchChange,
	onCourseChange,
}: DesktopCoursePickerProps) {
	return (
		<section className="hidden min-h-0 flex-1 overflow-hidden rounded-xl border border-border/60 bg-card lg:flex lg:flex-col">
			<div className="border-b border-border/60 p-3">
				<h3 className="px-1 text-xs font-bold text-muted-foreground/80">
					Courses
				</h3>
				<div className="relative mt-2">
					<SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="h-8 pl-8 text-xs focus-visible:ring-1"
						placeholder="Search courses"
						value={searchQuery}
						onChange={(event) => onSearchChange(event.target.value)}
						disabled={coursesLoading || !courses?.length}
					/>
				</div>
			</div>
			<ScrollArea className="min-h-0 flex-1 bg-background/50">
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
							const isSelected = selectedCourseCode === course.code;
							return (
								<button
									key={course.code}
									type="button"
									onClick={() => onCourseChange(course.code)}
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
							{searchQuery
								? "No courses match your search."
								: "No courses found."}
						</div>
					)}
				</div>
			</ScrollArea>
		</section>
	);
}
