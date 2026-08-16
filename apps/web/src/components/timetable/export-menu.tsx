import { DownloadIcon, LoaderCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type ExportFormat = "png" | "svg";
export type ExportAction = "download" | "save-as";

type ExportState =
	| { status: "idle" }
	| {
			status: "running";
			format: ExportFormat;
			action: ExportAction;
	  };

export type TimetableExportMenuProps = {
	targetSelector?: string;
	filenameBase?: string;
	scale?: number;
	borderRadius?: number;
};

type FilePickerType = {
	description: string;
	accept: Record<string, string[]>;
};

type ShowSaveFilePicker = (options: {
	suggestedName: string;
	types: FilePickerType[];
}) => Promise<{
	createWritable: () => Promise<{
		write: (data: Blob) => Promise<void>;
		close: () => Promise<void>;
	}>;
}>;

const DEFAULT_SELECTOR = "#weekly-timetable";
const DEFAULT_FILENAME_BASE = "timetable";
const DEFAULT_SCALE = 3;
const DEFAULT_BORDER_RADIUS = 8;

const FILE_PICKER_TYPES = {
	png: {
		description: "PNG image",
		accept: {
			"image/png": [".png"],
		},
	},
	svg: {
		description: "SVG image",
		accept: {
			"image/svg+xml": [".svg"],
		},
	},
} satisfies Record<ExportFormat, FilePickerType>;

const triggerDownload = (href: string, filename: string) => {
	const link = document.createElement("a");
	link.download = filename;
	link.href = href;
	link.rel = "noopener";
	link.click();
};

const saveBlobWithPicker = async (
	blob: Blob,
	format: ExportFormat,
	filename: string,
) => {
	if (!("showSaveFilePicker" in window)) {
		console.warn(
			"showSaveFilePicker is not supported in this browser. Falling back to download.",
		);
		const fallbackUrl = URL.createObjectURL(blob);
		triggerDownload(fallbackUrl, filename);
		URL.revokeObjectURL(fallbackUrl);
		return;
	}

	// SAFETY: showSaveFilePicker is checked for existence on window above
	const showSaveFilePickerFn = (
		window as Window & { showSaveFilePicker: ShowSaveFilePicker }
	).showSaveFilePicker;
	const handle = await showSaveFilePickerFn({
		suggestedName: filename,
		types: [FILE_PICKER_TYPES[format]],
	});
	const writable = await handle.createWritable();
	await writable.write(blob);
	await writable.close();
};

function filterExportNode(targetNode: Node): boolean {
	if (
		targetNode instanceof Element &&
		targetNode.getAttribute("data-export-hidden") === "true"
	) {
		return false;
	}
	return true;
}

export function TimetableExportMenu({
	targetSelector = DEFAULT_SELECTOR,
	filenameBase = DEFAULT_FILENAME_BASE,
	scale = DEFAULT_SCALE,
	borderRadius = DEFAULT_BORDER_RADIUS,
}: TimetableExportMenuProps) {
	const [exportState, setExportState] = useState<ExportState>({
		status: "idle",
	});
	const isExporting = exportState.status === "running";

	const exportTimetable = useCallback(
		async (format: ExportFormat, action: ExportAction) => {
			if (isExporting) return;

			setExportState({ status: "running", format, action });

			const actionLabel = action === "download" ? "Downloading" : "Saving";
			const statusToastId = toast.loading(
				`${actionLabel} ${format.toUpperCase()} timetable...`,
			);
			const node = document.querySelector<HTMLElement>(targetSelector);

			if (!node) {
				console.error("Unable to locate timetable container for export.");
				toast.error("Unable to export timetable", {
					id: statusToastId,
					description: "Timetable container was not found.",
				});
				setExportState({ status: "idle" });
				return;
			}

			try {
				const filename = `${filenameBase}.${format}`;
				const style = {
					borderRadius: `${borderRadius}px`,
				};
				if (format === "png") {
					const { domToPng } = await import("modern-screenshot");
					const dataUrl = await domToPng(node, {
						scale,
						style,
						filter: filterExportNode,
					});

					if (action === "download") {
						triggerDownload(dataUrl, filename);
						toast.success("Timetable exported", {
							id: statusToastId,
							description: `${filename} download has started.`,
						});
						return;
					}

					const response = await fetch(dataUrl);
					const blob = await response.blob();
					await saveBlobWithPicker(blob, format, filename);
					toast.success("Timetable exported", {
						id: statusToastId,
						description: `${filename} has been saved.`,
					});
					return;
				}

				const { domToSvg } = await import("modern-screenshot");
				const svgMarkup = await domToSvg(node, {
					scale,
					style,
					filter: filterExportNode,
				});

				const svgBlob = await (await fetch(svgMarkup)).blob();

				if (action === "download") {
					const objectUrl = URL.createObjectURL(svgBlob);
					triggerDownload(objectUrl, filename);
					URL.revokeObjectURL(objectUrl);
					toast.success("Timetable exported", {
						id: statusToastId,
						description: `${filename} download has started.`,
					});
					return;
				}

				await saveBlobWithPicker(svgBlob, format, filename);
				toast.success("Timetable exported", {
					id: statusToastId,
					description: `${filename} has been saved.`,
				});
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					toast("Export cancelled", {
						id: statusToastId,
						description: "No file was written.",
					});
					return;
				}

				console.error("Failed to export timetable", error);
				toast.error("Failed to export timetable", {
					id: statusToastId,
					description: "Please try again.",
				});
			} finally {
				setExportState({ status: "idle" });
			}
		},
		[borderRadius, filenameBase, isExporting, scale, targetSelector],
	);

	const handleSelect = useCallback(
		(format: ExportFormat, action: ExportAction) => () => {
			void exportTimetable(format, action);
		},
		[exportTimetable],
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button disabled={isExporting}>
					{isExporting ? (
						<LoaderCircle className="h-4 w-4 animate-spin" />
					) : (
						<DownloadIcon className="w-4 h-4" />
					)}
					{isExporting
						? `${exportState.action === "download" ? "Downloading" : "Saving"} ${exportState.format.toUpperCase()}...`
						: "Export"}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuItem
						disabled={isExporting}
						onSelect={handleSelect("png", "download")}
					>
						Download PNG
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={isExporting}
						onSelect={handleSelect("svg", "download")}
					>
						Download SVG
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						disabled={isExporting}
						onSelect={handleSelect("png", "save-as")}
					>
						Save as PNG
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={isExporting}
						onSelect={handleSelect("svg", "save-as")}
					>
						Save as SVG
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
