import { useEffect, useState } from "react";
import { PartialDeep, UnknownRecord } from "type-fest";
import type {
	CellAppearance,
	CellElements,
	CellMaterial,
	TextAlign,
} from "~/lib/models/cell-appearance";
import { PaywallOverlay } from "../paywall-overlay";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

export interface CellAppearanceLayoutSettingsProps {
	value: CellAppearance;
	/**
	 * "Base" values for the cell appearance settings.
	 * This will not be included in the final value when onChange is triggered.
	 * Only exists as the "default value" for the UI component.
	 */
	baseValues?: Partial<CellAppearance>;
	onChange?: (changes: PartialDeep<CellAppearance>) => void;
}

function ElementRow({
	name,
	elementKey,
	values,
	baseValues,
	onChange,
}: {
	name: string;
	elementKey: CellElements;
	values: CellAppearance;
	baseValues: Partial<CellAppearance>;
	onChange: (
		key: keyof CellAppearance,
		elementKey: CellElements,
		value: unknown,
	) => void;
}) {
	return (
		<div className="flex items-center justify-between p-3 border rounded-lg">
			<div>
				<div className="w-24 text-sm font-medium">{name}</div>
			</div>

			<div className="flex flex-wrap items-center justify-end gap-3">
				<Select
					value={values.weight?.[elementKey] || baseValues.weight?.[elementKey]}
					onValueChange={(value) => onChange("weight", elementKey, value)}
				>
					<SelectTrigger className="w-24">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="light">Light</SelectItem>
						<SelectItem value="normal">Normal</SelectItem>
						<SelectItem value="bold">Bold</SelectItem>
					</SelectContent>
				</Select>

				<div className="flex flex-row md:flex-row-reverse items-center justify-end gap-2 flex-1">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							onChange(
								"fontSize",
								elementKey,
								Math.max(
									8,
									(values.fontSize?.[elementKey] ||
										baseValues.fontSize?.[elementKey] ||
										12) - 1,
								),
							)
						}
					>
						-
					</Button>
					<span className="w-8 text-center text-sm tabular-nums">
						{values.fontSize?.[elementKey] ||
							baseValues.fontSize?.[elementKey] ||
							12}
					</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							onChange(
								"fontSize",
								elementKey,
								Math.min(
									32,
									(values.fontSize?.[elementKey] ||
										baseValues.fontSize?.[elementKey] ||
										12) + 1,
								),
							)
						}
					>
						+
					</Button>
				</div>

				<Label className="flex items-center gap-2 cursor-pointer">
					<Switch
						checked={
							values.visibility?.[elementKey] ??
							baseValues.visibility?.[elementKey] ??
							true
						}
						onCheckedChange={(checked) =>
							onChange("visibility", elementKey, checked)
						}
					/>
				</Label>
			</div>
		</div>
	);
}

export function CellAppearanceLayoutSettings({
	value,
	baseValues = value,
	onChange,
}: CellAppearanceLayoutSettingsProps) {
	const [internalValues, setInternalValues] = useState<CellAppearance>(value);

	// Update internal state when controlled value changes
	useEffect(() => {
		if (value) setInternalValues(value);
	}, [value]);

	const handleChange = (
		key: keyof CellAppearance,
		elementKey: CellElements | null,
		newValue: unknown,
	) => {
		const updatedValues: CellAppearance = structuredClone(internalValues);

		if (elementKey) {
			(updatedValues[key] as UnknownRecord) ??= {};
			(updatedValues[key] as UnknownRecord)[elementKey] = newValue;
		} else {
			(updatedValues as UnknownRecord)[key] = newValue;
		}

		setInternalValues(updatedValues);
		onChange?.(updatedValues as PartialDeep<CellAppearance>);
	};

	const handleElementChange = (
		key: keyof CellAppearance,
		elementKey: CellElements,
		value: unknown,
	) => {
		handleChange(key, elementKey, value);
	};

	const textAlignOptions: { value: TextAlign; label: string }[] = [
		{ value: "left", label: "Left" },
		{ value: "center", label: "Center" },
		{ value: "right", label: "Right" },
	];

	const cellMaterialOptions: { value: CellMaterial; label: string }[] = [
		{ value: "basic", label: "Basic" },
		{ value: "glass", label: "Glass" },
	];

	return (
		<div className="space-y-6">
			<div>
				<Label className="text-sm font-medium">Text Alignment</Label>
				<div className="flex gap-2 mt-2">
					{textAlignOptions.map((option) => (
						<Button
							key={option.value}
							type="button"
							variant={
								(internalValues.textAlign ?? baseValues!.textAlign) ===
								option.value
									? "default"
									: "outline"
							}
							onClick={() => {
								handleChange("textAlign", null, option.value);
							}}
						>
							{option.label}
						</Button>
					))}
				</div>
				<p className="text-xs text-muted-foreground mt-1">
					Choose how text is aligned within the course cell
				</p>
			</div>

			{process.env.NODE_ENV === "development" && (
				<PaywallOverlay className="p-2 -mx-2 rounded-lg overflow-clip" compact>
					<div>
						<Label className="text-sm font-medium">Cell Material</Label>
						<div className="flex gap-2 mt-2">
							{cellMaterialOptions.map((option) => (
								<Button
									key={option.value}
									type="button"
									variant={
										(internalValues.material ?? baseValues!.material) ===
										option.value
											? "default"
											: "outline"
									}
									onClick={() => {
										handleChange("material", null, option.value);
									}}
								>
									{option.label}
								</Button>
							))}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Choose the visual style of the course cell
						</p>
					</div>
				</PaywallOverlay>
			)}
			<div className="space-y-3">
				<div>
					<Label className="text-sm font-medium">Element Settings</Label>
					<p className="text-xs text-muted-foreground">
						Configure font weight, size, and visibility for each element
					</p>
				</div>
				<ElementRow
					name="Code"
					elementKey="code"
					values={internalValues}
					baseValues={baseValues!}
					onChange={handleElementChange}
				/>
				<ElementRow
					name="Course Name"
					elementKey="name"
					values={internalValues}
					baseValues={baseValues!}
					onChange={handleElementChange}
				/>
				<ElementRow
					name="Time"
					elementKey="time"
					values={internalValues}
					baseValues={baseValues!}
					onChange={handleElementChange}
				/>
				<ElementRow
					name="Location"
					elementKey="location"
					values={internalValues}
					baseValues={baseValues!}
					onChange={handleElementChange}
				/>
			</div>
		</div>
	);
}
