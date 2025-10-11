import {
	BookOpen,
	ClipboardPlus,
	GraduationCap,
	LucideIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
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
import { cn } from "~/lib/utils/styles";
import { ImporterStep, useImporterSelectionStore } from "./shared";
import { UnaffiliationNotice } from "./unaffiliation-notice";

interface SourceOptionProps {
	title: string;
	description: string;
	icon: LucideIcon;
	eyebrow?: string;
	onSelect: () => void;
}

function SourceOption({
	title,
	description,
	icon: Icon,
	eyebrow,
	onSelect,
}: SourceOptionProps) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"group relative flex w-full flex-col gap-2 rounded-2xl border border-border/70 bg-background px-5 py-4 text-left",
				"transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
			)}
		>
			<div className="flex items-start justify-between">
				<div className="flex w-full items-center gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Icon className="size-5" />
					</span>
					<div className="w-full">
						<span className="flex text-base justify-between font-medium text-foreground">
							{title}
							{eyebrow ? (
								<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
									{eyebrow}
								</span>
							) : null}
						</span>
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					</div>
				</div>
			</div>
		</button>
	);
}

interface SourceSelectionDialogProps {
	trigger: ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SourceSelectionDialog({
	trigger,
	open,
	onOpenChange,
}: SourceSelectionDialogProps) {
	const { setCurrentStep, setOpen } = useImporterSelectionStore(
		useShallow((state) => pickNavigationFns(state)),
	);

	const navigate = (step: ImporterStep) => {
		setCurrentStep(step);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="flex min-w-0 flex-col gap-6 sm:max-w-xl">
				<DialogHeader className="gap-1 text-left">
					<DialogTitle>Import from UiTM</DialogTitle>
					<DialogDescription>
						Choose the starting point that fits what you already have on hand.
					</DialogDescription>
				</DialogHeader>

				<UnaffiliationNotice />

				<div className="space-y-6 overflow-y-auto">
					<section className="space-y-4">
						<div className="space-y-1">
							<h3 className="text-lg font-semibold text-foreground">
								UiTM MyStudent
							</h3>
							<p className="text-sm text-muted-foreground">
								Fetch your timetable directly from UiTM MyStudent with just your
								Student ID.
							</p>
						</div>
						<SourceOption
							title="Use Student ID"
							description="Fastest way—pulls your current timetable straight from MyStudent."
							icon={GraduationCap}
							eyebrow="Recommended"
							onSelect={() => navigate("my-student")}
						/>
					</section>

					<section className="space-y-4">
						<div className="space-y-1">
							<h3 className="text-lg font-semibold text-foreground">
								UiTM iCress
							</h3>
							<p className="text-sm text-muted-foreground">
								Prefer to manage things manually? Choose specific groups or
								paste your course slip.
							</p>
						</div>
						<div className="space-y-3">
							<SourceOption
								title="Pick courses & groups"
								description="Browse available courses for your campus and add the groups you need."
								icon={BookOpen}
								onSelect={() => navigate("campus-faculty")}
							/>
							<SourceOption
								title="Paste course slip"
								description="Drop in the registration slip text and let Weekview match everything automatically."
								icon={ClipboardPlus}
								onSelect={() => navigate("course-slip")}
							/>
						</div>
					</section>
				</div>

				<DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
					<Button
						variant="secondary"
						className="w-full sm:w-auto"
						onClick={() => {
							setOpen(false);
						}}
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function pickNavigationFns(
	state: ReturnType<typeof useImporterSelectionStore.getState>,
) {
	return {
		setCurrentStep: state.setCurrentStep,
		setOpen: state.setOpen,
	};
}
