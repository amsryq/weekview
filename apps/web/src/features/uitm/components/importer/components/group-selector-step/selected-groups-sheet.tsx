import { Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import type { UiTMCourseSection } from "../../../../course-section";

interface SelectedGroupsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedGroups: UiTMCourseSection[];
	onRemove: (courseCode: string, groupCode: string) => void;
}

export function SelectedGroupsSheet({
	open,
	onOpenChange,
	selectedGroups,
	onRemove,
}: SelectedGroupsSheetProps) {
	const selectionCount = selectedGroups.length;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
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
				<div className="mx-6 my-4 h-[40dvh] overflow-y-auto overscroll-contain touch-pan-y rounded-lg border border-border/50 bg-background sm:h-[260px]">
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
										onClick={() => onRemove(internal.code, internal.group)}
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
				</div>
				<div className="mx-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
					<SheetClose asChild>
						<Button variant="secondary" size="sm" className="w-full sm:w-auto">
							Close
						</Button>
					</SheetClose>
				</div>
			</SheetContent>
		</Sheet>
	);
}
