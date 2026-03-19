import { DownloadIcon } from "lucide-react";
import { useCallback } from "react";
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

const FILE_PICKER_TYPES: Record<ExportFormat, FilePickerType> = {
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
};

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

	const showSaveFilePickerFn =
		window.showSaveFilePicker as unknown as ShowSaveFilePicker;
	const handle = await showSaveFilePickerFn({
		suggestedName: filename,
		types: [FILE_PICKER_TYPES[format]],
	});
	const writable = await handle.createWritable();
	await writable.write(blob);
	await writable.close();
};

export function TimetableExportMenu({
	targetSelector = DEFAULT_SELECTOR,
	filenameBase = DEFAULT_FILENAME_BASE,
	scale = DEFAULT_SCALE,
	borderRadius = DEFAULT_BORDER_RADIUS,
}: TimetableExportMenuProps) {
	const exportTimetable = useCallback(
		async (format: ExportFormat, action: ExportAction) => {
			const node = document.querySelector<HTMLElement>(targetSelector);

			if (!node) {
				console.error("Unable to locate timetable container for export.");
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
					});

					if (action === "download") {
						triggerDownload(dataUrl, filename);
						return;
					}

					const response = await fetch(dataUrl);
					const blob = await response.blob();
					await saveBlobWithPicker(blob, format, filename);
					return;
				}

				const { domToSvg } = await import("modern-screenshot");
				const svgMarkup = await domToSvg(node, {
					scale,
					style,
				});

				const svgBlob = await (await fetch(svgMarkup)).blob();

				if (action === "download") {
					const objectUrl = URL.createObjectURL(svgBlob);
					triggerDownload(objectUrl, filename);
					URL.revokeObjectURL(objectUrl);
					return;
				}

				await saveBlobWithPicker(svgBlob, format, filename);
			} catch (error) {
				console.error("Failed to export timetable", error);
			}
		},
		[borderRadius, filenameBase, scale, targetSelector],
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
				<Button>
					<DownloadIcon className="w-4 h-4" />
					Export
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuItem onSelect={handleSelect("png", "download")}>
						Download PNG
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={handleSelect("svg", "download")}>
						Download SVG
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onSelect={handleSelect("png", "save-as")}>
						Save as PNG
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={handleSelect("svg", "save-as")}>
						Save as SVG
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
