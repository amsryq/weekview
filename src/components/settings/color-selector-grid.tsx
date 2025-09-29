"use client";

import { isEqual } from "es-toolkit";
import { Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { ColorEntry } from "~/lib/models/color-entry";
import { useColorStore } from "~/lib/stores/color-store";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ColorEntryConfigurer } from "./color-entry-configurer";

interface ColorPickerProps {
	value?: ColorEntry.Schema;
	onChange: (value: ColorEntry.Schema) => void;
}

/**
 * Allow managing (adding/removing) colors from ColorStore
 */
export function ColorSelectorGrid({ value, onChange }: ColorPickerProps) {
	const [colorType, setBackgroundType] = useState<"solid" | "gradient">(
		value?.type || "solid",
	);

	const [showCustomDialog, setShowCustomDialog] = useState(false);
	const [customColor, setCustomColor] = useState<ColorEntry.Schema>({
		type: "solid",
		color: "#000000",
	});

	const colors = useColorStore((state) => state.colors);
	const addColor = useColorStore((state) => state.addColor);
	const removeColor = useColorStore((state) => state.removeColor);
	const lastSelected = useRef<ColorEntry.Schema | null>(null);

	// Filter colors by current color type
	const filteredColors = colors.filter((color) => color.def.type === colorType);

	// Check if a color is currently selected
	const isColorSelected = (color: ColorEntry.Schema) => {
		if (!value || value.type !== color.type) return false;
		return isEqual(value, color);
	};

	const handleColorSelect = (color: ColorEntry.Schema) => {
		lastSelected.current = value || null;
		onChange(color);
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
				value={colorType}
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
			<div className="flex flex-wrap items-center gap-2">
				{filteredColors.map((color) => (
					<div key={color.id} className="flex relative items-center group">
						<button
							type="button"
							style={color.getBackgroundStyle()}
							onClick={() => handleColorSelect(color.def)}
							className={`w-8 h-8 rounded transition-all flex-shrink-0 ${
								isColorSelected(color.def)
									? "border-2 border-primary shadow-md scale-110"
									: "border border-border hover:scale-110"
							}`}
						/>
						{/* Trash button for user-added colors */}
						{!color.predefined && (
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
										colors.find((c) => c.def.type === color.def.type)?.def;

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
								Add Custom {colorType === "solid" ? "Color" : "Gradient"}
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<ColorEntryConfigurer
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
