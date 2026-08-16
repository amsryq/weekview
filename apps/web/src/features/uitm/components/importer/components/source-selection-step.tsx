import {
	BookOpen,
	ClipboardPlus,
	Database,
	GraduationCap,
	LucideIcon,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
	ResponsiveDialogClose,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "~/components/ui/responsive-dialog";
import { cn } from "~/lib/utils/styles";
import { ImporterStep, useImporterSelectionStore } from "../utils/shared";
import { type SourceKey, useSourceStatuses } from "../utils/source-status";
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
				"group relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
				disabled
					? "opacity-60 cursor-not-allowed"
					: "hover:bg-primary/5 focus-visible:outline-none focus-visible:bg-primary/10 focus-visible:z-10",
			)}
		>
			<span
				className={cn(
					"flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
					disabled && "bg-muted text-muted-foreground",
				)}
			>
				<Icon className="size-4" />
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<span className="text-sm font-semibold text-foreground">{title}</span>
					{!disabled && eyebrow ? (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
							{eyebrow}
						</span>
					) : null}
					{disabled ? (
						<span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
							Unavailable
						</span>
					) : null}
				</div>
				<p className="text-xs text-muted-foreground">{description}</p>
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
		description: "Fetch directly with your Student ID.",
		options: [
			{
				key: "my-student",
				title: "Use Student ID",
				description: "Fastest way—pulls from MyStudent.",
				icon: GraduationCap,
				eyebrow: "Recommended",
			},
		],
	},
	{
		key: "icress",
		title: "UiTM iCress",
		description: "Choose groups manually or paste a slip.",
		options: [
			{
				key: "group-selector",
				title: "Pick courses & groups",
				description: "Browse available courses for your campus.",
				icon: BookOpen,
			},
			{
				key: "course-slip",
				title: "Paste course slip",
				description: "Match registration slip text automatically.",
				icon: ClipboardPlus,
			},
		],
	},
];

export function SourceSelectionStep() {
	const { setCurrentStep } = useImporterSelectionStore(
		useShallow((state) => pickNavigationFns(state)),
	);
	const sources = useSourceStatuses();

	const navigate = (step: ImporterStep) => {
		setCurrentStep(step);
	};

	const sortedSections = SECTIONS.map((section) => {
		const sortedOptions = section.options.toSorted((a, b) => {
			const aAvail = sources[a.key]?.available ?? true;
			const bAvail = sources[b.key]?.available ?? true;
			return aAvail === bAvail ? 0 : aAvail ? -1 : 1;
		});
		return { ...section, options: sortedOptions };
	}).toSorted((a, b) => {
		const aAvail = a.options.some((o) => sources[o.key]?.available ?? true);
		const bAvail = b.options.some((o) => sources[o.key]?.available ?? true);
		return aAvail === bAvail ? 0 : aAvail ? -1 : 1;
	});

	return (
		<>
			<ResponsiveDialogHeader className="gap-1">
				<ResponsiveDialogTitle>Import from UiTM</ResponsiveDialogTitle>
				<ResponsiveDialogDescription>
					Choose the starting point that fits what you have.
				</ResponsiveDialogDescription>
			</ResponsiveDialogHeader>

			<div className="flex-1 space-y-4 overflow-y-auto px-6 py-2 min-h-0">
				{import.meta.env.VITE_UITM_MOCK === "true" && (
					<Alert className="relative rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-none transition-colors dark:border-amber-500/30 dark:bg-amber-500/10">
						<Database className="size-4 text-amber-500 dark:text-amber-400" />
						<AlertTitle className="line-clamp-none text-sm font-bold text-amber-600 dark:text-amber-400">
							Mock Data Active
						</AlertTitle>
						<AlertDescription className="text-xs leading-normal inline text-muted-foreground/90">
							UiTM timetable data is currently being mocked. Real data will be
							ignored.
						</AlertDescription>
					</Alert>
				)}
				<UnaffiliationNotice />

				<div className="space-y-4">
					{sortedSections.map((section) => (
						<div key={section.key} className="space-y-2">
							<div className="px-1">
								<h3 className="text-xs font-bold text-muted-foreground/80">
									{section.title}
								</h3>
							</div>
							<div className="overflow-hidden rounded-xl border border-border/60 bg-card divide-y divide-border/60">
								{section.options.map((option) => {
									const status = sources[option.key] ?? {
										available: true,
									};
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
						</div>
					))}
				</div>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end p-6 mt-auto">
				<ResponsiveDialogClose asChild>
					<Button variant="secondary" className="w-full sm:w-auto">
						Close
					</Button>
				</ResponsiveDialogClose>
			</div>
		</>
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
