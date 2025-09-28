import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
	Dropzone,
	DropzoneContent,
	DropzoneEmptyState,
} from "../ui/shadcn-io/dropzone";
import { Slider } from "../ui/slider";

interface BackgroundImageUploadProps {
	value: string | null;
	onChange: (imageUrl: string | null) => void;
	options: {
		opacity: number;
	};
	onOptionsChange: (
		options: Partial<BackgroundImageUploadProps["options"]>,
	) => void;
}

export function BackgroundImageUpload({
	value,
	onChange,
	options,
	onOptionsChange,
}: BackgroundImageUploadProps) {
	const [files, setFiles] = useState<File[] | undefined>(
		value ? [] : undefined,
	);

	const handleDrop = (acceptedFiles: File[]) => {
		if (acceptedFiles.length === 0) return;

		const file = acceptedFiles[0];

		// Check file size (5MB limit)
		const maxSize = 5 * 1024 * 1024; // 5MB in bytes
		if (file.size > maxSize) {
			alert("File size must be less than 5MB");
			return;
		}

		// Convert file to base64 data URL for storage
		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			onChange(result);
		};
		reader.onerror = () => {
			alert("Error reading file");
		};
		reader.readAsDataURL(file);
		setFiles(acceptedFiles);
	};

	const handleError = (error: Error) => {
		alert(error.message);
	};

	const handleRemove = () => {
		onChange(null);
		setFiles(undefined);
	};

	return (
		<div className="space-y-3">
			<Dropzone
				accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] }}
				maxFiles={1}
				maxSize={5 * 1024 * 1024} // 5MB
				onDrop={handleDrop}
				onError={handleError}
				src={files}
				className="h-32 p-0"
			>
				<DropzoneEmptyState>
					<div className="flex flex-col items-center justify-center text-center">
						<p className="font-medium text-sm mb-1">Upload background image</p>
						<p className="text-muted-foreground text-xs">
							Drag and drop or click to upload
						</p>
					</div>
				</DropzoneEmptyState>
				<DropzoneContent>
					{value ? (
						<div className="relative w-full h-full">
							<img
								src={value}
								alt="Background preview"
								className="w-full h-full object-cover rounded"
							/>
							<div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
								<p className="text-white text-sm font-medium">
									Click or drag to replace
								</p>
							</div>
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="absolute top-2 right-2"
								onClick={handleRemove}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : null}
				</DropzoneContent>
			</Dropzone>

			{value && (
				<div className="space-y-4 pt-4 border-t">
					<div>
						<Label className="text-sm font-medium">Opacity</Label>
						<div className="flex items-center gap-3 mt-2">
							<Slider
								value={[options.opacity]}
								onValueChange={([opacity]) => onOptionsChange({ opacity })}
								max={1}
								min={0.1}
								step={0.1}
								className="flex-1"
							/>
							<span className="text-sm text-muted-foreground w-12">
								{Math.round(options.opacity * 100)}%
							</span>
						</div>
					</div>
				</div>
			)}

			<p className="text-xs text-muted-foreground">
				Supported formats: JPG, PNG, GIF, WebP • Maximum file size: 5MB
			</p>
		</div>
	);
}
