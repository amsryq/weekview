"use client";

import { isEqual } from "es-toolkit";
import { Plus, X } from "lucide-react";
import React, { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type {
	BackgroundAppearance,
	GradientDirection,
} from "~/lib/models/cell-appearance";
import { getBackgroundStyle } from "~/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface GradientPickerProps {
	value: BackgroundAppearance;
	onChange: (value: BackgroundAppearance) => void;
}

type FormValues = {
	type: BackgroundAppearance["type"];
	color: string;
	gradientColors: string[];
	gradientDirection: GradientDirection;
};

const gradientDirections: { value: GradientDirection; label: string }[] = [
	{ value: "to-r", label: "→ Right" },
	{ value: "to-l", label: "← Left" },
	{ value: "to-t", label: "↑ Top" },
	{ value: "to-b", label: "↓ Bottom" },
	{ value: "to-tr", label: "↗ Top Right" },
	{ value: "to-tl", label: "↖ Top Left" },
	{ value: "to-br", label: "↘ Bottom Right" },
	{ value: "to-bl", label: "↙ Bottom Left" },
];

function toFormValues(v: BackgroundAppearance): FormValues {
	if (v.type === "solid") {
		return {
			type: "solid",
			color: v.color,
			gradientColors: [],
			gradientDirection: "to-r",
		};
	}
	return {
		type: "gradient",
		color: v.gradientColors[0] || "#000000",
		gradientColors: Array.isArray(v.gradientColors)
			? [...v.gradientColors]
			: [],
		gradientDirection: v.gradientDirection,
	};
}

function toBackgroundAppearance(f: FormValues): BackgroundAppearance {
	if (f.type === "solid") {
		return { type: "solid", color: f.color ?? "#000000" };
	}

	// Ensure the gradient branch always satisfies the schema shape.
	const colors =
		f.gradientColors && f.gradientColors.length > 0
			? f.gradientColors
			: [f.color ?? "#000000", "#ffffff"];

	return {
		type: "gradient",
		gradientColors: colors,
		gradientDirection: f.gradientDirection ?? "to-r",
	};
}

export function GradientPicker({ value, onChange }: GradientPickerProps) {
	const { control, watch, setValue, getValues } = useForm<FormValues>({
		defaultValues: toFormValues(value),
	});

	const { fields, append, remove } = useFieldArray({
		control,
		// bug: TypeScript being sane challenge
		name: "gradientColors" as unknown as never,
	});

	const watched = watch();
	const previousValueRef = React.useRef<BackgroundAppearance>(value);

	// Update form when external value changes
	useEffect(() => {
		if (!isEqual(value, previousValueRef.current)) {
			const formValues = toFormValues(value);
			setValue("type", formValues.type);
			setValue("color", formValues.color);
			setValue("gradientColors", formValues.gradientColors);
			setValue("gradientDirection", formValues.gradientDirection);
			previousValueRef.current = value;
		}
	}, [value, setValue]);

	useEffect(() => {
		const newValue = toBackgroundAppearance(watched);
		if (!isEqual(newValue, previousValueRef.current)) {
			previousValueRef.current = newValue;
			onChange(newValue);
		}
	}, [watched, onChange]);

	const previewStyle = getBackgroundStyle(toBackgroundAppearance(watched));

	return (
		<div className="space-y-4">
			{/* Type Switch */}
			<div className="space-y-2">
				<Label>Background Type</Label>
				<div className="flex gap-2">
					<Button
						type="button"
						size="sm"
						variant={watched.type === "solid" ? "default" : "outline"}
						onClick={() => setValue("type", "solid")}
					>
						Solid
					</Button>
					<Button
						type="button"
						size="sm"
						variant={watched.type === "gradient" ? "default" : "outline"}
						onClick={() => {
							setValue("type", "gradient");
							const current = getValues();
							if (
								!current.gradientColors ||
								current.gradientColors.length === 0
							) {
								// Prefer current.color if available, otherwise fallback.
								setValue("gradientColors", [
									current.color ?? "#000000",
									"#ffffff",
								]);
							}
							if (!current.gradientDirection) {
								setValue("gradientDirection", "to-r");
							}
						}}
					>
						Gradient
					</Button>
				</div>
			</div>

			{/* Preview */}
			<div className="space-y-2">
				<Label>Preview</Label>
				<div
					className="h-12 rounded border border-border"
					style={previewStyle}
				/>
			</div>

			{watched.type === "solid" ? (
				<div className="space-y-2">
					<Label>Color</Label>
					<Controller
						control={control}
						name="color"
						render={({ field }) => (
							<div className="flex items-center gap-3">
								<Input
									type="color"
									value={field.value}
									onChange={(e) => field.onChange(e.target.value)}
									className="w-20 h-10 p-1"
								/>
								<Input
									type="text"
									value={field.value}
									onChange={(e) => field.onChange(e.target.value)}
									placeholder="#000000"
									className="flex-1"
								/>
							</div>
						)}
					/>
				</div>
			) : (
				<div className="space-y-4">
					{/* Direction */}
					<div className="space-y-2">
						<Label>Gradient Direction</Label>
						<Controller
							control={control}
							name="gradientDirection"
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger>
										<SelectValue placeholder="Direction" />
									</SelectTrigger>
									<SelectContent>
										{gradientDirections.map((dir) => (
											<SelectItem key={dir.value} value={dir.value}>
												{dir.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</div>

					{/* Gradient Colors */}
					<div className="space-y-2">
						<Label>Gradient Colors</Label>
						<div className="space-y-2">
							{fields.map((fieldItem, index) => (
								<div key={fieldItem.id} className="flex items-center gap-2">
									<Controller
										control={control}
										name={`gradientColors.${index}` as const}
										render={({ field }) => (
											<>
												<Input
													type="color"
													value={field.value}
													onChange={(e) => field.onChange(e.target.value)}
													className="w-12 h-8 p-1 flex-shrink-0"
												/>
												<Input
													type="text"
													value={field.value}
													onChange={(e) => field.onChange(e.target.value)}
													className="flex-1"
												/>
											</>
										)}
									/>
									{fields.length > 2 && (
										<Button
											type="button"
											size="icon"
											variant="outline"
											onClick={() => remove(index)}
											className="w-8 h-8 flex-shrink-0"
										>
											<X className="w-4 h-4" />
										</Button>
									)}
								</div>
							))}

							{/* Add new */}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => append("#000000")}
								className="flex items-center gap-1"
							>
								<Plus className="w-4 h-4" /> Add Color
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
