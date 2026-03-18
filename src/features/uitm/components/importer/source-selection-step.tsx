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
	ResponsiveDialog,
	ResponsiveDialogClose,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "~/components/ui/responsive-dialog";
import { cn } from "~/lib/utils/styles";
import { ImporterStep, useImporterSelectionStore } from "./shared";
import { type SourceKey, useSourceStatuses } from "./source-status";
import { UnaffiliationNotice } from "./unaffiliation-notice";

interface SourceOptionProps {
	title: string;
	description: string;
	icon: LucideIcon;
	eyebrow?: string;
	onSelect: () => void;
	disabled?: boolean;
	unavailableReason?: string;
}

function SourceOption({
	title,
	description,
	icon: Icon,
	eyebrow,
	onSelect,
	disabled,
	unavailableReason,
}: SourceOptionProps) {
	return (
		<button
			type="button"
			onClick={disabled ? undefined : onSelect}
			disabled={disabled}
			title={unavailableReason}
			className={cn(
				"group relative flex w-full flex-col gap-2 rounded-2xl border border-border/70 bg-background px-5 py-4 text-left",
				disabled
					? "opacity-60 cursor-not-allowed"
					: "transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
			)}
		>
			<div className="flex items-start justify-between">
				<div className="flex w-full items-center gap-3">
					<span
						className={cn(
							"flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
							disabled && "bg-muted text-muted-foreground",
						)}
					>
						<Icon className="size-5" />
					</span>
					<div className="w-full">
						<span className="flex text-base justify-between font-medium text-foreground">
							<span className="flex items-center gap-2">
								{title}
								{disabled ? (
									<span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-destructive">
										Unavailable
									</span>
								) : null}
							</span>
							{!disabled && eyebrow ? (
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

type SectionData = {
	key: "mystudent" | "icress";
	title: string;
	description: string;
	options: {
		key: SourceKey;
		title: string;
		description: string;
		icon: LucideIcon;
		eyebrow?: string;
	}[];
};

const SECTIONS: SectionData[] = [
	{
		key: "mystudent",
		title: "UiTM MyStudent",
		description:
			"Fetch your timetable directly from UiTM MyStudent with just your Student ID.",
		options: [
			{
				key: "my-student",
				title: "Use Student ID",
				description:
					"Fastest way—pulls your current timetable straight from MyStudent.",
				icon: GraduationCap,
				eyebrow: "Recommended",
			},
		],
	},
	{
		key: "icress",
		title: "UiTM iCress",
		description:
			"Prefer to manage things manually? Choose specific groups or paste your course slip.",
		options: [
			{
				key: "campus-faculty",
				title: "Pick courses & groups",
				description:
					"Browse available courses for your campus and add the groups you need.",
				icon: BookOpen,
			},
			{
				key: "course-slip",
				title: "Paste course slip",
				description:
					"Drop in the registration slip text and let Weekview match everything automatically.",
				icon: ClipboardPlus,
			},
		],
	},
];

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
	const { setCurrentStep } = useImporterSelectionStore(
		useShallow((state) => pickNavigationFns(state)),
	);
	const sources = useSourceStatuses();

	const navigate = (step: ImporterStep) => {
		setCurrentStep(step);
	};

	const sortedSections = [...SECTIONS]
		.map((section) => {
			const sortedOptions = [...section.options].sort((a, b) => {
				const aAvail = sources[a.key]?.available ?? true;
				const bAvail = sources[b.key]?.available ?? true;
				return aAvail === bAvail ? 0 : aAvail ? -1 : 1;
			});
			return { ...section, options: sortedOptions };
		})
		.sort((a, b) => {
			const aAvail = a.options.some((o) => sources[o.key]?.available ?? true);
			const bAvail = b.options.some((o) => sources[o.key]?.available ?? true);
			return aAvail === bAvail ? 0 : aAvail ? -1 : 1;
		});

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger>
			<ResponsiveDialogContent
				desktopClassName="sm:max-w-xl h-180"
				mobileClassName="max-h-[95dvh]"
			>
				<ResponsiveDialogHeader className="gap-1">
					<ResponsiveDialogTitle>Import from UiTM</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Choose the starting point that fits what you already have on hand.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<div className="flex-1 space-y-6 overflow-y-auto px-6 min-h-0">
					<UnaffiliationNotice />

					{sortedSections.map((section, idx) => (
						<section
							key={section.key}
							className={cn(
								"space-y-4",
								idx === sortedSections.length - 1 && "pb-6",
							)}
						>
							<div className="space-y-1">
								<h3 className="text-lg font-semibold text-foreground">
									{section.title}
								</h3>
								<p className="text-sm text-muted-foreground">
									{section.description}
								</p>
							</div>
							<div className="space-y-3">
								{section.options.map((option) => {
									const status = sources[option.key] ?? { available: true };
									return (
										<SourceOption
											key={option.key}
											title={option.title}
											description={option.description}
											icon={option.icon}
											eyebrow={option.eyebrow}
											onSelect={() => navigate(option.key)}
											disabled={!status.available}
											unavailableReason={status.unavailableReason}
										/>
									);
								})}
							</div>
						</section>
					))}
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:justify-end p-6 mt-auto">
					<ResponsiveDialogClose asChild>
						<Button variant="secondary" className="w-full sm:w-auto">
							Close
						</Button>
					</ResponsiveDialogClose>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
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
