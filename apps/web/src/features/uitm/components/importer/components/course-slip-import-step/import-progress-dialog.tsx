import { AlertCircle, CheckIcon, Loader2, XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "~/components/ui/responsive-dialog";
import type { Campus } from "../../../../models/campus";
import type { Faculty } from "../../../../models/faculty";
import type { CourseImportProgress } from "../../utils/shared";

interface ImportProgressDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isImporting: boolean;
	cancelRequested: boolean;
	progressTitle: string;
	progressSubtitle: string;
	errorCount: number;
	campusInfo: {
		campus?: Campus;
		faculty?: Faculty;
	};
	courseProgress: CourseImportProgress[];
	onRequestCancel: () => void;
}

export function ImportProgressDialog({
	open,
	onOpenChange,
	isImporting,
	cancelRequested,
	progressTitle,
	progressSubtitle,
	errorCount,
	campusInfo,
	courseProgress,
	onRequestCancel,
}: ImportProgressDialogProps) {
	return (
		<ResponsiveDialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isImporting) {
					onOpenChange(nextOpen);
				}
			}}
		>
			<ResponsiveDialogContent
				desktopClassName="sm:max-w-2xl"
				mobileClassName="max-h-[90dvh]"
			>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle className="flex items-center gap-2">
						{isImporting ? (
							<Loader2 className="size-5 animate-spin text-primary" />
						) : errorCount > 0 ? (
							<AlertCircle className="size-5 text-amber-500" />
						) : (
							<CheckIcon className="size-5 text-emerald-500" />
						)}
						<span>{progressTitle}</span>
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{progressSubtitle}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<div className="flex-1 space-y-4 py-4 px-6 overflow-y-auto min-h-0">
					{/* Campus & Faculty Status */}
					<div className="rounded-lg border bg-muted/30 p-4">
						<h3 className="text-sm font-semibold mb-3">Import Status</h3>
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Campus</span>
								<div className="flex items-center gap-2">
									{campusInfo.campus ? (
										<>
											<span className="font-medium">
												{campusInfo.campus.name}
											</span>
											<CheckIcon className="size-4 text-emerald-500" />
										</>
									) : isImporting ? (
										<Loader2 className="size-4 animate-spin text-muted-foreground" />
									) : (
										<span className="text-muted-foreground">Pending</span>
									)}
								</div>
							</div>
							{(campusInfo.campus?.requireFaculty || campusInfo.faculty) && (
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Faculty</span>
									<div className="flex items-center gap-2">
										{campusInfo.faculty ? (
											<>
												<span className="font-medium">
													{campusInfo.faculty.code} – {campusInfo.faculty.name}
												</span>
												<CheckIcon className="size-4 text-emerald-500" />
											</>
										) : isImporting ? (
											<Loader2 className="size-4 animate-spin text-muted-foreground" />
										) : (
											<span className="text-muted-foreground">Pending</span>
										)}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Courses Progress */}
					{courseProgress.length > 0 && (
						<div className="rounded-lg border bg-background">
							<div className="border-b bg-muted/30 px-4 py-3">
								<h3 className="text-sm font-semibold">Courses</h3>
							</div>
							<div className="max-h-[400px] overflow-y-auto">
								<div className="divide-y">
									{courseProgress.map((item, idx) => (
										<div
											key={`${item.courseCode}-${item.group}-${idx}`}
											className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
										>
											<div className="flex-1 min-w-0">
												<div className="flex items-baseline gap-2">
													<span className="font-medium text-sm">
														{item.courseCode}
													</span>
													{item.courseName && (
														<span className="text-xs text-muted-foreground truncate">
															{item.courseName}
														</span>
													)}
												</div>
												<div className="flex items-center gap-2 mt-0.5">
													<span className="text-xs text-muted-foreground">
														{item.group}
													</span>
													{item.reason && item.status === "error" && (
														<span className="text-xs text-destructive">
															• {item.reason}
														</span>
													)}
												</div>
											</div>
											<div className="shrink-0 ml-3">
												{item.status === "pending" ? (
													<div className="size-5 rounded-full border-2 border-muted-foreground/30" />
												) : item.status === "running" ? (
													<Loader2 className="size-5 animate-spin text-primary" />
												) : item.status === "success" ? (
													<div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center">
														<CheckIcon className="size-3 text-white" />
													</div>
												) : (
													<div className="size-5 rounded-full bg-destructive flex items-center justify-center">
														<XIcon className="size-3 text-white" />
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between border-t p-6 mt-auto">
					<Button
						variant="ghost"
						onClick={onRequestCancel}
						className="w-full sm:w-auto"
						disabled={!isImporting || cancelRequested}
					>
						Cancel import
					</Button>

					<Button
						variant="secondary"
						onClick={() => onOpenChange(false)}
						className="w-full sm:w-auto"
						disabled={isImporting && !cancelRequested}
					>
						Close
					</Button>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
