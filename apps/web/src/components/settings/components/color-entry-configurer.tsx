import { Plus, XIcon } from "lucide-react";
import { useCallback } from "react";
import { ColorEntry, GradientDirection } from "~/lib/models/color-entry";
import { Button } from "../../ui/button";
import { ColorPicker } from "../../ui/color-picker";
import { Label } from "../../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

interface ColorEntryConfigurerProps {
	value: ColorEntry.Schema;
	onChange: (value: ColorEntry.Schema) => void;
	showTabs?: boolean;
}

const GRADIENT_DIRECTIONS: { value: GradientDirection; label: string }[] = [
	{ value: "to-r", label: "→ Right" },
	{ value: "to-l", label: "← Left" },
	{ value: "to-t", label: "↑ Top" },
	{ value: "to-b", label: "↓ Bottom" },
	{ value: "to-tr", label: "↗ Top Right" },
	{ value: "to-tl", label: "↖ Top Left" },
	{ value: "to-br", label: "↘ Bottom Right" },
	{ value: "to-bl", label: "↙ Bottom Left" },
];

function isColorType(cause: unknown): cause is "solid" | "gradient" {
	return cause === "solid" || cause === "gradient";
}

function isGradientDirection(cause: unknown): cause is GradientDirection {
	return (
		cause === "to-r" ||
		cause === "to-l" ||
		cause === "to-t" ||
		cause === "to-b" ||
		cause === "to-tr" ||
		cause === "to-tl" ||
		cause === "to-br" ||
		cause === "to-bl"
	);
}

export function ColorEntryConfigurer({
	value,
	onChange,
	showTabs = true,
}: ColorEntryConfigurerProps) {
	const handleTypeChange = useCallback(
		(newType: "solid" | "gradient") => {
			if (newType === value.type) return;

			if (newType === "solid") {
				onChange({
					type: "solid",
					color:
						value.type === "gradient"
							? value.gradientColors[0] || "#000000"
							: "#000000",
					predefined: value.predefined,
				});
			} else {
				onChange({
					type: "gradient",
					gradientColors:
						value.type === "solid"
							? [value.color, "#ffffff"]
							: ["#000000", "#ffffff"],
					gradientDirection: "to-r",
					predefined: value.predefined,
				});
			}
		},
		[value, onChange],
	);

	const handleSolidColorChange = useCallback(
		(color: string) => {
			onChange({
				type: "solid",
				color,
				predefined: value.predefined,
			});
		},
		[value.predefined, onChange],
	);

	const handleGradientDirectionChange = useCallback(
		(dir: GradientDirection) => {
			if (value.type !== "gradient") return;
			onChange({
				type: "gradient",
				gradientColors: value.gradientColors,
				gradientDirection: dir,
				predefined: value.predefined,
			});
		},
		[value, onChange],
	);

	const handleGradientColorChange = useCallback(
		(index: number, color: string) => {
			if (value.type !== "gradient") return;
			const newColors = [...value.gradientColors];
			newColors[index] = color;
			onChange({
				type: "gradient",
				gradientColors: newColors,
				gradientDirection: value.gradientDirection,
				predefined: value.predefined,
			});
		},
		[value, onChange],
	);

	const handleAddGradientColor = useCallback(() => {
		if (value.type !== "gradient") return;
		onChange({
			type: "gradient",
			gradientColors: [...value.gradientColors, "#888888"],
			gradientDirection: value.gradientDirection,
			predefined: value.predefined,
		});
	}, [value, onChange]);

	const handleRemoveGradientColor = useCallback(
		(index: number) => {
			if (value.type !== "gradient") return;
			onChange({
				type: "gradient",
				gradientColors: value.gradientColors.filter((_, i) => i !== index),
				gradientDirection: value.gradientDirection,
				predefined: value.predefined,
			});
		},
		[value, onChange],
	);

	const previewStyle = ColorEntry.getBackgroundStyle(value);

	const solidColor = value.type === "solid" ? value.color : "#000000";
	const gradientColors =
		value.type === "gradient" ? value.gradientColors : ["#000000", "#ffffff"];
	const gradientDirection =
		value.type === "gradient" ? value.gradientDirection : "to-r";

	return (
		<div className="space-y-4">
			<Tabs
				value={value.type}
				onValueChange={(v) => {
					if (isColorType(v)) handleTypeChange(v);
				}}
			>
				{showTabs && (
					<TabsList className="w-full grid grid-cols-2">
						<TabsTrigger value="solid">Solid</TabsTrigger>
						<TabsTrigger value="gradient">Gradient</TabsTrigger>
					</TabsList>
				)}

				{/* Preview */}
				<div className="space-y-2 mt-4">
					<Label>Preview</Label>
					<div className="h-12 rounded-lg border" style={previewStyle} />
				</div>

				{/* Solid Color Tab */}
				<TabsContent value="solid" className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label>Color</Label>
						<ColorInput value={solidColor} onChange={handleSolidColorChange} />
					</div>
				</TabsContent>

				{/* Gradient Tab */}
				<TabsContent value="gradient" className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label>Direction</Label>
						<Select
							value={gradientDirection}
							onValueChange={(v) => {
								if (isGradientDirection(v)) handleGradientDirectionChange(v);
							}}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{GRADIENT_DIRECTIONS.map(({ value: dirValue, label }) => (
									<SelectItem key={dirValue} value={dirValue}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Colors</Label>
						<div className="space-y-2">
							{gradientColors.map((color, index) => (
								<div key={index} className="flex items-center gap-2">
									<ColorInput
										value={color}
										onChange={(c) => handleGradientColorChange(index, c)}
									/>
									{gradientColors.length > 2 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveGradientColor(index)}
											className="size-8 shrink-0"
										>
											<XIcon className="size-4" />
										</Button>
									)}
								</div>
							))}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleAddGradientColor}
								className="w-full"
							>
								<Plus className="size-4 mr-1" />
								Add Color
							</Button>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

interface ColorInputProps {
	value: string;
	onChange: (value: string) => void;
}

function ColorInput({ value, onChange }: ColorInputProps) {
	return <ColorPicker value={value} onChange={onChange} />;
}
