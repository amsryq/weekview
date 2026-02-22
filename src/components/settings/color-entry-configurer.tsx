import { Plus, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColorEntry, GradientDirection } from "~/lib/models/color-entry";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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

export function ColorEntryConfigurer({
	value,
	onChange,
	showTabs = true,
}: ColorEntryConfigurerProps) {
	const [type, setType] = useState<"solid" | "gradient">(value.type);
	const [solidColor, setSolidColor] = useState(
		value.type === "solid" ? value.color : "#000000",
	);
	const [gradientColors, setGradientColors] = useState<string[]>(
		value.type === "gradient" ? value.gradientColors : ["#000000", "#ffffff"],
	);
	const [gradientDirection, setGradientDirection] = useState<GradientDirection>(
		value.type === "gradient" ? value.gradientDirection : "to-r",
	);

	const lastEmittedRef = useRef<ColorEntry.Schema>(value);

	// Build the current color entry from state
	const currentEntry = useMemo((): ColorEntry.Schema => {
		if (type === "solid") {
			return { type: "solid", color: solidColor };
		}
		return {
			type: "gradient",
			gradientColors:
				gradientColors.length >= 2 ? gradientColors : ["#000000", "#ffffff"],
			gradientDirection,
		};
	}, [type, solidColor, gradientColors, gradientDirection]);

	// Sync internal state when external value changes
	useEffect(() => {
		const prev = lastEmittedRef.current;
		if (value.type !== prev.type) {
			setType(value.type);
		}
		if (
			value.type === "solid" &&
			(prev.type !== "solid" || value.color !== prev.color)
		) {
			setSolidColor(value.color);
		}
		if (value.type === "gradient") {
			if (
				prev.type !== "gradient" ||
				JSON.stringify(value.gradientColors) !==
					JSON.stringify(prev.gradientColors)
			) {
				setGradientColors(value.gradientColors);
			}
			if (
				prev.type !== "gradient" ||
				value.gradientDirection !== prev.gradientDirection
			) {
				setGradientDirection(value.gradientDirection);
			}
		}
		lastEmittedRef.current = value;
	}, [value]);

	// Emit changes to parent
	useEffect(() => {
		if (
			JSON.stringify(currentEntry) !== JSON.stringify(lastEmittedRef.current)
		) {
			lastEmittedRef.current = currentEntry;
			onChange(currentEntry);
		}
	}, [currentEntry, onChange]);

	const handleTypeChange = useCallback(
		(newType: "solid" | "gradient") => {
			setType(newType);
			if (newType === "gradient" && gradientColors.length < 2) {
				setGradientColors(["#000000", "#ffffff"]);
			}
		},
		[gradientColors.length],
	);

	const handleGradientColorChange = useCallback(
		(index: number, color: string) => {
			setGradientColors((prev) => {
				const newColors = [...prev];
				newColors[index] = color;
				return newColors;
			});
		},
		[],
	);

	const handleAddGradientColor = useCallback(() => {
		setGradientColors((prev) => [...prev, "#888888"]);
	}, []);

	const handleRemoveGradientColor = useCallback((index: number) => {
		setGradientColors((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const previewStyle = ColorEntry.getBackgroundStyle(currentEntry);

	return (
		<div className="space-y-4">
			<Tabs
				value={type}
				onValueChange={(v) => handleTypeChange(v as "solid" | "gradient")}
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
						<ColorInput value={solidColor} onChange={setSolidColor} />
					</div>
				</TabsContent>

				{/* Gradient Tab */}
				<TabsContent value="gradient" className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label>Direction</Label>
						<Select
							value={gradientDirection}
							onValueChange={(v) =>
								setGradientDirection(v as GradientDirection)
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{GRADIENT_DIRECTIONS.map(({ value, label }) => (
									<SelectItem key={value} value={value}>
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
	return (
		<div className="flex items-center gap-2">
			<Input
				type="color"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-12 h-10 p-1 shrink-0 cursor-pointer"
			/>
			<Input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="#000000"
				className="flex-1 font-mono"
			/>
		</div>
	);
}
