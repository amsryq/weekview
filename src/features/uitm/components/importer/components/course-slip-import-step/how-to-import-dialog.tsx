import { Button } from "~/components/ui/button";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "~/components/ui/responsive-dialog";

interface HowToImportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function HowToImportDialog({
	open,
	onOpenChange,
}: HowToImportDialogProps) {
	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent
				desktopClassName="flex flex-col sm:max-w-2xl"
				mobileClassName="max-h-[90dvh] rounded-t-2xl p-0 flex flex-col overflow-hidden"
			>
				<ResponsiveDialogHeader className="px-6 pt-6">
					<ResponsiveDialogTitle>
						Importing your course slip
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription className="sr-only">
						A short guide on how to import your UiTM course slip.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<div className="flex-1 py-2 px-6 overflow-y-auto min-h-0">
					<p className="text-sm text-foreground">
						You can import your course slip by copying your course registration
						details from the{" "}
						<a
							className="underline"
							href="https://ecr.uitm.edu.my/estudent/ecr/main.cfm?status=1"
						>
							UiTM's e-Course Registration System (eCR)
						</a>
						. Here's what to copy:
					</p>

					<img
						src="/images/uitm-course-slip-select.png"
						alt="What to select on the course slip"
					/>
				</div>
				<div className="flex justify-end p-6 border-t mt-auto">
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
