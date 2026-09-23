import { Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Logo } from "~/components/brand/logo";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SHOW_WATERMARK_OPTION } from "~/lib/config/feature-flags";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";

export interface TimetableWatermarkProps {
	labelColor: string;
}

export function TimetableWatermark({ labelColor }: TimetableWatermarkProps) {
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	if (!SHOW_WATERMARK_OPTION) {
		return (
			<div
				className="absolute bottom-6 right-6 flex items-center gap-1.5 opacity-40 pointer-events-none select-none z-10"
				aria-hidden="true"
			>
				<span className="text-[12px] font-medium" style={{ color: labelColor }}>
					created with
				</span>
				<Logo height={16} style={{ fill: labelColor }} aria-label="weekview" />
			</div>
		);
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="absolute bottom-6 right-6 flex items-center gap-1.5 opacity-40 hover:opacity-80 transition-opacity select-none z-10 cursor-pointer bg-transparent border-0 p-0 outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
						aria-label="Watermark options"
					>
						<span
							className="text-[12px] font-medium"
							style={{ color: labelColor }}
						>
							created with
						</span>
						<Logo
							height={16}
							style={{ fill: labelColor }}
							aria-label="weekview"
						/>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" side="top">
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setShowConfirmDialog(true)}
					>
						<Trash2 className="size-4" />
						Remove watermark
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog
				open={showConfirmDialog}
				onOpenChange={setShowConfirmDialog}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Remove watermark?</DialogTitle>
						<DialogDescription className="text-sm leading-relaxed text-foreground/80 pt-1">
							Weekview is a free tool built for students. Word-of-mouth is how
							we reach more students. Keeping the small watermark helps your
							classmates and peers discover the app when you export or share
							your timetable.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant="ghost"
							className="hover:bg-none"
							onClick={() => {
								TimetablePreferencesStore.getState().setValue(
									"showWatermark",
									false,
								);
								setShowConfirmDialog(false);
							}}
						>
							Remove anyway
						</Button>
						<DialogClose asChild>
							<Button>
								Keep watermark
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

