import { useShallow } from "zustand/react/shallow";
import { Button } from "~/components/ui/button";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils/styles";
import { useImporterSelectionStore } from "./shared";
import { UnaffiliationNotice } from "./unaffiliation-notice";

interface SourceOptionProps {
	title: string;
	description: string;
	onSelect: () => void;
}

function SourceOption({ title, description, onSelect }: SourceOptionProps) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"flex flex-col w-full rounded-2xl border border-border bg-background px-5 py-4 text-left",
				"transition hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none",
				"focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
			)}
		>
			<span className="text-base font-medium text-foreground">{title}</span>
			<span className="mt-1 text-sm text-muted-foreground">{description}</span>
		</button>
	);
}

function SourceSelectionStep() {
	const { setCurrentStep, setOpen } = useImporterSelectionStore(
		useShallow((state) => ({
			setCurrentStep: state.setCurrentStep,
			setOpen: state.setOpen,
		})),
	);

	return (
		<>
			<DialogHeader>
				<DialogTitle>Import from UiTM</DialogTitle>
				<DialogDescription>Choose the source to import from.</DialogDescription>
			</DialogHeader>

			<div className="overflow-y-auto space-y-4">
				<UnaffiliationNotice />
				<section className="space-y-4">
					<div className="space-y-1">
						<h3 className="text-lg font-semibold text-foreground">
							UiTM MyStudent
						</h3>
						<p className="text-sm text-muted-foreground">
							Fetch timetable information directly from MyStudent.
						</p>
					</div>
					<SourceOption
						title="From your Student ID"
						description="Fetch timetable information directly from MyStudent. The simplest approach yet."
						onSelect={() => setCurrentStep(4)}
					/>
				</section>

				<section className="space-y-4">
					<div className="space-y-1">
						<h3 className="text-lg font-semibold text-foreground">
							UiTM iCress
						</h3>
						<p className="text-sm text-muted-foreground">
							Add courses directly by selecting your groups, or paste your
							course registration slip.
						</p>
					</div>
					<div className="space-y-3">
						<SourceOption
							title="Choose your courses and groups"
							description="Add courses directly by selecting your groups."
							onSelect={() => setCurrentStep(1)}
						/>
						<SourceOption
							title="Import from your course registration slip copy"
							description="Automatically determine courses and groups based on your UiTM eCR registration slip."
							onSelect={() => setCurrentStep(3)}
						/>
					</div>
				</section>
			</div>

			<DialogFooter className="mt-6">
				<Button
					variant="secondary"
					onClick={() => {
						setOpen(false);
					}}
				>
					Close
				</Button>
			</DialogFooter>
		</>
	);
}

export { SourceSelectionStep };
