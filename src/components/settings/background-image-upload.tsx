
import { Trash2Icon, UploadIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
	Dropzone,
	DropzoneContent,
	DropzoneEmptyState,
} from "../ui/shadcn-io/dropzone";
import { Slider } from "../ui/slider";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FORMATS = {
	"image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
};

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
	const [isLoading, setIsLoading] = useState(false);

	const handleDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (!file) return;

			if (file.size > MAX_FILE_SIZE) {
				toast.error("File too large", {
					description: "Please select an image under 5MB.",
				});
				return;
			}

			setIsLoading(true);
			const reader = new FileReader();

			reader.onload = (e) => {
				const result = e.target?.result as string;
				onChange(result);
				setIsLoading(false);
			};

			reader.onerror = () => {
				toast.error("Failed to read file", {
					description: "Please try again with a different image.",
				});
				setIsLoading(false);
			};

			reader.readAsDataURL(file);
		},
		[onChange],
	);

	const handleError = useCallback((error: Error) => {
		toast.error("Upload failed", { description: error.message });
	}, []);

	const handleRemove = useCallback(() => {
		onChange(null);
	}, [onChange]);

	return (
		<div className="space-y-4">
			{value ? (
				<ImagePreview
					src={value}
					onRemove={handleRemove}
					opacity={options.opacity}
					onOpacityChange={(opacity) => onOptionsChange({ opacity })}
				/>
			) : (
				<Dropzone
					accept={ACCEPTED_FORMATS}
					maxFiles={1}
					maxSize={MAX_FILE_SIZE}
					onDrop={handleDrop}
					onError={handleError}
					disabled={isLoading}
					className="h-32"
				>
					<DropzoneEmptyState>
						<div className="flex flex-col items-center justify-center gap-2 text-center">
							<UploadIcon className="size-8 text-muted-foreground" />
							<div>
								<p className="font-medium text-sm">Upload background image</p>
								<p className="text-muted-foreground text-xs">
									Drag and drop or click to browse
								</p>
							</div>
						</div>
					</DropzoneEmptyState>
					<DropzoneContent />
				</Dropzone>
			)}

			<p className="text-xs text-muted-foreground">
				Supported: JPG, PNG, GIF, WebP • Max size: 5MB
			</p>
		</div>
	);
}

interface ImagePreviewProps {
	src: string;
	onRemove: () => void;
	opacity: number;
	onOpacityChange: (opacity: number) => void;
}

function ImagePreview({
	src,
	onRemove,
	opacity,
	onOpacityChange,
}: ImagePreviewProps) {
	return (
		<div className="space-y-4">
			<div className="relative group rounded-lg overflow-hidden border">
				<img
					src={src}
					alt="Background preview"
					className="w-full h-32 object-cover"
				/>
				<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={onRemove}
					>
						<Trash2Icon className="size-4 mr-1" />
						Remove
					</Button>
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label className="text-sm">Opacity</Label>
					<span className="text-sm text-muted-foreground tabular-nums">
						{Math.round(opacity * 100)}%
					</span>
				</div>
				<Slider
					value={[opacity]}
					onValueChange={([v]) => onOpacityChange(v)}
					min={0.1}
					max={1}
					step={0.05}
				/>
			</div>
		</div>
	);
}
