import { PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils/styles";
import type { UiTMCourseSection } from "../../../../course-section";
import type { Course } from "../../../../models/course";
import { getFriendlyUiTMErrorMessage } from "../../utils/error-feedback";
import { SelectedGroupsSheet } from "./selected-groups-sheet";

interface GroupListItemProps {
	group: UiTMCourseSection;
	summary: string;
	alreadyAdded: boolean;
	conflictReason: string | undefined;
	onSelect: () => void;
}

function GroupListItem({
	group,
	summary,
	alreadyAdded,
	conflictReason,
	onSelect,
}: GroupListItemProps) {
	const { internal } = group;
	const disabled = alreadyAdded || Boolean(conflictReason);
	const reason = alreadyAdded
		? "Added"
		: conflictReason
			? `Conflict: ${conflictReason}`
			: undefined;

	return (
		<div className="group flex items-center justify-between gap-4 overflow-hidden px-4 py-2.5 transition-colors hover:bg-primary/5">
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold text-foreground">
						{internal.group}
					</span>
					{reason ? (
						<span
							className={cn(
								"shrink-0 text-[10px] font-medium",
								alreadyAdded ? "text-primary" : "text-destructive",
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
				onClick={onSelect}
			>
				<PlusIcon className="size-3" />
				Add
			</Button>
		</div>
	);
}

function GroupListSkeleton() {
	return (
		<>
			{Array.from({ length: 6 }).map((_, index) => (
				<div
					key={index}
					className="flex animate-pulse items-center gap-4 px-4 py-2.5"
				>
					<div className="h-6 w-16 rounded bg-muted/60" />
					<div className="h-2.5 flex-1 rounded bg-muted/60" />
				</div>
			))}
		</>
	);
}

interface AvailableGroupsPanelProps {
	selectedCourse: Course | undefined;
	filteredGroups: UiTMCourseSection[];
	groupSummaries: Map<string, string>;
	selectedGroupKeys: Set<string>;
	groupConflicts: Map<string, string[]>;
	selectedGroups: UiTMCourseSection[];
	groupsLoading: boolean;
	groupsError: Error | null;
	searchQuery: string;
	selectionSheetOpen: boolean;
	onSearchChange: (query: string) => void;
	onSelectionSheetOpenChange: (open: boolean) => void;
	onGroupSelect: (group: UiTMCourseSection) => void;
	onGroupRemove: (courseCode: string, groupCode: string) => void;
}

export function AvailableGroupsPanel({
	selectedCourse,
	filteredGroups,
	groupSummaries,
	selectedGroupKeys,
	groupConflicts,
	selectedGroups,
	groupsLoading,
	groupsError,
	searchQuery,
	selectionSheetOpen,
	onSearchChange,
	onSelectionSheetOpenChange,
	onGroupSelect,
	onGroupRemove,
}: AvailableGroupsPanelProps) {
	return (
		<section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card lg:h-[480px] lg:w-[480px]">
			<div className="flex flex-col gap-3 border-b border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<h3 className="px-1 text-xs font-bold text-muted-foreground/80">
						Available groups
					</h3>
					<SelectedGroupsSheet
						open={selectionSheetOpen}
						onOpenChange={onSelectionSheetOpenChange}
						selectedGroups={selectedGroups}
						onRemove={onGroupRemove}
					/>
				</div>
				<div className="relative w-full sm:w-64">
					<SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="h-8 pl-8 text-xs focus-visible:ring-1"
						placeholder="Search or filter"
						value={searchQuery}
						onChange={(event) => onSearchChange(event.target.value)}
						disabled={!selectedCourse || groupsLoading}
					/>
				</div>
			</div>

			<div className="h-[280px] overflow-y-auto overscroll-contain touch-pan-y bg-background/50 lg:h-auto lg:flex-1">
				<div className="divide-y divide-border/60 text-left">
					{groupsError ? (
						<div className="p-4 text-sm text-destructive">
							{getFriendlyUiTMErrorMessage(groupsError)}
						</div>
					) : groupsLoading ? (
						<GroupListSkeleton />
					) : filteredGroups.length ? (
						filteredGroups.map((group) => {
							const { internal } = group;
							const key = `${internal.code}-${internal.group}`;
							const conflictCodes = groupConflicts.get(key);

							return (
								<GroupListItem
									key={key}
									group={group}
									summary={groupSummaries.get(key) ?? ""}
									alreadyAdded={selectedGroupKeys.has(key)}
									conflictReason={conflictCodes?.join(", ")}
									onSelect={() => onGroupSelect(group)}
								/>
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
			</div>
		</section>
	);
}
