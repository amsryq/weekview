import { isEqual, omit } from "es-toolkit";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { usePaywall } from "~/lib/hooks/paywall";
import { ColorEntry } from "~/lib/models/color-entry";
import { useColorStore } from "~/lib/stores/color-store";
import { cn } from "~/lib/utils/styles";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { ColorEntryConfigurer } from "./color-entry-configurer";

interface ColorSelectorGridProps {
	value?: ColorEntry.Schema;
	onChange: (value: ColorEntry.Schema) => void;
}

type ColorType = "solid" | "gradient";

export function ColorSelectorGrid({ value, onChange }: ColorSelectorGridProps) {
	const [colorType, setColorType] = useState<ColorType>(value?.type || "solid");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [customColor, setCustomColor] = useState<ColorEntry.Schema>({
		type: "solid",
		color: "#000000",
	});

	const { checkAccess } = usePaywall();
	const colors = useColorStore((state) => state.colors);
	const addColor = useColorStore((state) => state.addColor);
	const removeColor = useColorStore((state) => state.removeColor);
	const lastSelectedRef = useRef<ColorEntry.Schema | null>(null);

	const filteredColors = colors.filter((c) => c.def.type === colorType);

	const isColorSelected = useCallback(
		(color: ColorEntry.Schema) => {
			if (!value || value.type !== color.type) return false;
			return isEqual(omit(value, ["predefined"]), color);
		},
		[value],
	);

	const handleColorSelect = useCallback(
		(color: ColorEntry.Schema) => {
			lastSelectedRef.current = value || null;
			onChange(color);
		},
		[value, onChange],
	);

	const handleTypeChange = useCallback(
		(type: ColorType) => {
			if (type === "gradient" && !checkAccess()) return;

			setColorType(type);
			setCustomColor(
				type === "solid"
					? { type: "solid", color: "#000000" }
					: {
							type: "gradient",
							gradientColors: ["#000000", "#ffffff"],
							gradientDirection: "to-r",
						},
			);
		},
		[checkAccess],
	);

	const handleAddCustomColor = useCallback(() => {
		addColor(customColor);
		handleColorSelect(customColor);
		setIsDialogOpen(false);
		setCustomColor(
			colorType === "solid"
				? { type: "solid", color: "#000000" }
				: {
						type: "gradient",
						gradientColors: ["#000000", "#ffffff"],
						gradientDirection: "to-r",
					},
		);
	}, [customColor, colorType, addColor, handleColorSelect]);

	const handleRemoveColor = useCallback(
		(colorId: string, colorDef: ColorEntry.Schema) => {
			removeColor(colorId);

			// Select a fallback color after removal
			const fallback =
				lastSelectedRef.current ||
				colors.find((c) => c.def.type === colorDef.type && c.id !== colorId)
					?.def;

			if (fallback) {
				handleColorSelect(fallback);
			}
		},
		[colors, removeColor, handleColorSelect],
	);

	const handleOpenAddDialog = useCallback(
		(e: React.MouseEvent) => {
			if (colorType === "gradient" && !checkAccess()) {
				e.preventDefault();
				return;
			}
		},
		[colorType, checkAccess],
	);

	return (
		<div className="space-y-4 flex flex-col items-end">
			{/* Type Toggle */}
			<Tabs
				value={colorType}
				onValueChange={(v) => handleTypeChange(v as ColorType)}
				className="gap-0"
			>
				<TabsList>
					<TabsTrigger value="solid">Solid</TabsTrigger>
					<TabsTrigger value="gradient">Gradient</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Color Grid */}
			<div className="flex flex-wrap items-center justify-end gap-2">
				{filteredColors.map((color) => (
					<ColorSwatch
						key={color.id}
						color={color}
						isSelected={isColorSelected(color.def)}
						onSelect={() => handleColorSelect(color.def)}
						onRemove={() => handleRemoveColor(color.id, color.def)}
					/>
				))}

				{/* Add Button */}
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="size-8 border-dashed"
							onClick={handleOpenAddDialog}
						>
							<PlusIcon className="size-4" />
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>
								Add Custom {colorType === "solid" ? "Color" : "Gradient"}
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<ColorEntryConfigurer
								value={customColor}
								onChange={setCustomColor}
								showTabs={false}
							/>
							<div className="flex gap-2 justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button type="button" onClick={handleAddCustomColor}>
									Add
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}

interface ColorSwatchProps {
	color: ColorEntry;
	isSelected: boolean;
	onSelect: () => void;
	onRemove: () => void;
}

function ColorSwatch({
	color,
	isSelected,
	onSelect,
	onRemove,
}: ColorSwatchProps) {
	return (
		<div className="relative group">
			<button
				type="button"
				style={color.getBackgroundStyle()}
				onClick={onSelect}
				className={cn(
					"size-8 rounded transition-all border",
					isSelected
						? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
						: "border-border hover:scale-110",
				)}
			/>
			{!color.predefined && (
				<Button
					type="button"
					size="icon"
					variant="destructive"
					className="absolute -top-1.5 -right-1.5 size-5 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
				>
					<Trash2Icon className="size-3" />
				</Button>
			)}
		</div>
	);
}
