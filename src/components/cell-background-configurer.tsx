"use client";

import { isEqual } from "es-toolkit";
import { Plus, X } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Control, Controller, useFieldArray, useForm } from "react-hook-form";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface CellBackgroundConfigurerProps {
	value: BackgroundAppearance;
	onChange: (value: BackgroundAppearance) => void;
	showTabs?: boolean;
}

type FormValues = {
	type: BackgroundAppearance["type"];
	color: string;
	gradientColors: string[];
	gradientDirection: GradientDirection;
};

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

function toFormValues(value: BackgroundAppearance): FormValues {
	if (value.type === "solid") {
		return {
			type: "solid",
			color: value.color,
			gradientColors: [],
			gradientDirection: "to-r",
		};
	}
	return {
		type: "gradient",
		color: value.gradientColors[0] || "#000000",
		gradientColors: [...value.gradientColors],
		gradientDirection: value.gradientDirection,
	};
}

function toBackgroundAppearance(form: FormValues): BackgroundAppearance {
	if (form.type === "solid") {
		return { type: "solid", color: form.color || "#000000" };
	}
	const colors = form.gradientColors?.length
		? form.gradientColors
		: [form.color || "#000000", "#ffffff"];
	return {
		type: "gradient",
		gradientColors: colors,
		gradientDirection: form.gradientDirection || "to-r",
	};
}

const ColorInputRow = ({
	value,
	onChange,
	onRemove,
	showRemove,
}: {
	value: string;
	onChange: (value: string) => void;
	onRemove?: () => void;
	showRemove?: boolean;
}) => (
	<div className="flex items-center gap-2">
		<Input
			type="color"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="w-12 h-8 p-1 flex-shrink-0"
		/>
		<Input
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="flex-1"
		/>
		{showRemove && onRemove && (
			<Button
				type="button"
				size="icon"
				variant="outline"
				onClick={onRemove}
				className="w-8 h-8"
			>
				<X className="w-4 h-4" />
			</Button>
		)}
	</div>
);

const GradientDirectionSelect = ({
	control,
}: {
	control: Control<FormValues>;
}) => (
	<Controller
		control={control}
		name="gradientDirection"
		render={({ field }) => (
			<Select value={field.value} onValueChange={field.onChange}>
				<SelectTrigger>
					<SelectValue placeholder="Direction" />
				</SelectTrigger>
				<SelectContent>
					{GRADIENT_DIRECTIONS.map(({ value, label }) => (
						<SelectItem key={value} value={value}>
							{label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		)}
	/>
);

const ColorPicker = ({ control }: { control: Control<FormValues> }) => (
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
					className="flex-1"
				/>
			</div>
		)}
	/>
);

export function CellBackgroundConfigurer({
	value,
	onChange,
	showTabs,
}: CellBackgroundConfigurerProps) {
	const { control, watch, setValue, getValues } = useForm<FormValues>({
		defaultValues: toFormValues(value),
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "gradientColors" as never,
	});

	const watched = watch();
	const previousValueRef = useRef<BackgroundAppearance>(value);

	// Sync form when external value changes
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

	// Emit changes to parent
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
			{/* Tabs */}
			<Tabs
				value={watched.type}
				onValueChange={(val) => {
					if (val === "solid") {
						setValue("type", "solid");
					} else {
						setValue("type", "gradient");
						const current = getValues();
						if (!current.gradientColors?.length) {
							setValue("gradientColors", [
								current.color || "#000000",
								"#ffffff",
							]);
						}
						if (!current.gradientDirection) {
							setValue("gradientDirection", "to-r");
						}
					}
				}}
			>
				{showTabs && (
					<TabsList className="w-full">
						<TabsTrigger value="solid">Solid</TabsTrigger>
						<TabsTrigger value="gradient">Gradient</TabsTrigger>
					</TabsList>
				)}

				{/* Preview */}
				<div className="space-y-2">
					<Label>Preview</Label>
					<div
						className="h-12 rounded border border-border"
						style={previewStyle}
					/>
				</div>

				{/* Solid Tab */}
				<TabsContent value="solid" className="space-y-4">
					<div className="space-y-2">
						<Label>Color</Label>
						<ColorPicker control={control} />
					</div>
				</TabsContent>

				{/* Gradient Tab */}
				<TabsContent value="gradient" className="space-y-4">
					{/* Direction */}
					<div className="space-y-2">
						<Label>Gradient Direction</Label>
						<GradientDirectionSelect control={control} />
					</div>

					{/* Colors */}
					<div className="space-y-2">
						<Label>Gradient Colors</Label>
						<div className="space-y-2">
							{fields.map((fieldItem, index) => (
								<Controller
									key={fieldItem.id}
									control={control}
									name={`gradientColors.${index}` as const}
									render={({ field }) => (
										<ColorInputRow
											value={field.value}
											onChange={field.onChange}
											onRemove={() => remove(index)}
											showRemove={fields.length > 2}
										/>
									)}
								/>
							))}
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
				</TabsContent>
			</Tabs>
		</div>
	);
}
