"use client";

import { isEqual } from "es-toolkit";
import { Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { BackgroundAppearance } from "~/lib/models/cell-appearance";
import { useColorStore } from "~/lib/stores/color-store";
import { getBackgroundStyle } from "~/lib/utils";
import { CellBackgroundConfigurer } from "./cell-background-configurer";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface ColorPickerProps {
	value?: BackgroundAppearance;
	onChange: (value: BackgroundAppearance) => void;
}

/**
 * Allow managing (adding/removing) colors from ColorStore
 */
export function ColorSelectorGrid({ value, onChange }: ColorPickerProps) {
	const [backgroundType, setBackgroundType] = useState<"solid" | "gradient">(
		value?.type || "solid",
	);

	const [showCustomDialog, setShowCustomDialog] = useState(false);
	const [customColor, setCustomColor] = useState<BackgroundAppearance>({
		type: "solid",
		color: "#000000",
	});

	const colors = useColorStore((state) => state.colors);
	const addColor = useColorStore((state) => state.addColor);
	const removeColor = useColorStore((state) => state.removeColor);
	const lastSelected = useRef<BackgroundAppearance | null>(null);

	// Filter colors by current background type
	const filteredColors = colors.filter(
		(color) => color.background.type === backgroundType,
	);

	// Check if a color is currently selected
	const isColorSelected = (background: BackgroundAppearance) => {
		if (!value || value.type !== background.type) return false;
		return isEqual(value, background);
	};

	const handleColorSelect = (background: BackgroundAppearance) => {
		lastSelected.current = value || null;
		onChange(background);
	};

	const handleAddCustomColor = () => {
		addColor(customColor);
		handleColorSelect(customColor);
		setShowCustomDialog(false);
	};

	const handleTypeChange = (type: "solid" | "gradient") => {
		setBackgroundType(type);
		// Update custom color type when switching
		if (type === "solid") {
			setCustomColor({ type: "solid", color: "#000000" });
		} else {
			setCustomColor({
				type: "gradient",
				gradientColors: ["#000000", "#ffffff"],
				gradientDirection: "to-r",
			});
		}
	};

	return (
		<div className="space-y-4">
			{/* Background Type Toggle */}
			<Tabs
				value={backgroundType}
				onValueChange={(value) =>
					handleTypeChange(value as "solid" | "gradient")
				}
			>
				<TabsList>
					<TabsTrigger value="solid">Solid</TabsTrigger>
					<TabsTrigger value="gradient">Gradient</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Color Row */}
			<div className="flex items-center gap-2">
				{filteredColors.map((color) => (
					<div key={color.id} className="relative group">
						<button
							type="button"
							onClick={() => handleColorSelect(color.background)}
							className={`w-8 h-8 rounded transition-all flex-shrink-0 ${
								isColorSelected(color.background)
									? "border-2 border-primary shadow-md scale-110"
									: "border border-border hover:scale-110"
							}`}
							style={getBackgroundStyle(color.background)}
							title={color.name || "Color"}
						/>
						{/* Trash button for user-added colors */}
						{!color.isPredefined && (
							<Button
								type="button"
								size="icon"
								variant="destructive"
								className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={(e) => {
									e.stopPropagation();
									removeColor(color.id);

									const resortColor =
										lastSelected.current ||
										colors.find(
											(c) => c.background.type === color.background.type,
										)?.background;

									if (resortColor) {
										handleColorSelect(resortColor);
									}
								}}
							>
								<Trash2 className="w-2 h-2" />
							</Button>
						)}
					</div>
				))}

				{/* Add Button */}
				<Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
					<DialogTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="w-8 h-8 border-dashed flex-shrink-0"
						>
							<Plus className="w-4 h-4" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								Add Custom {backgroundType === "solid" ? "Color" : "Gradient"}
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<CellBackgroundConfigurer
								value={customColor}
								onChange={setCustomColor}
							/>
							<div className="flex gap-2">
								<Button type="button" onClick={handleAddCustomColor}>
									Add
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowCustomDialog(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
