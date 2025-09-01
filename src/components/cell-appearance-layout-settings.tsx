import { zodResolver } from "@hookform/resolvers/zod";
import { isEqual, toMerged } from "es-toolkit";
import React, { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { PartialDeep } from "type-fest";
import type {
	CellAppearance,
	CellElements,
	FontWeight,
	TextAlign,
} from "~/lib/models/cell-appearance";
import { CellAppearanceSchema } from "~/lib/models/cell-appearance";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { getDirtyValues } from "~/lib/util/rhf";
import { Button } from "./ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

export interface CellAppearanceLayoutSettingsProps {
	value?: CellAppearance;
	defaultValues?: Partial<CellAppearance>;
	onChange?: (changes: PartialDeep<CellAppearance>) => void;
	onSubmit?: (changes: PartialDeep<CellAppearance>) => void;
}

function ElementRow({
	name,
	elementKey,
	form,
}: {
	name: string;
	elementKey: CellElements;
	form: ReturnType<typeof useForm<CellAppearance>>;
}) {
	return (
		<div className="flex items-center justify-between p-3 border rounded-lg">
			<div>
				<div className="w-24 text-sm font-medium">{name}</div>
			</div>

			<div className="flex items-center gap-3">
				<FormField
					control={form.control}
					name={`weight.${elementKey}`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Select
									value={field.value || "normal"}
									onValueChange={field.onChange}
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
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`fontSize.${elementKey}`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className="flex items-center gap-2 flex-1">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											field.onChange(Math.max(8, (field.value || 12) - 1))
										}
									>
										-
									</Button>
									<span className="w-8 text-center text-sm tabular-nums">
										{field.value || 12}
									</span>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											field.onChange(Math.min(32, (field.value || 12) + 1))
										}
									>
										+
									</Button>
								</div>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`visibility.${elementKey}`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Label className="flex items-center gap-2 cursor-pointer">
									<Switch
										checked={field.value ?? true}
										onCheckedChange={field.onChange}
									/>
								</Label>
							</FormControl>
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}

export function CellAppearanceLayoutSettings({
	value,
	defaultValues = value,
	onChange,
	onSubmit,
}: CellAppearanceLayoutSettingsProps) {
	const createDefaultValues = useMemo((): CellAppearance => {
		const base = TimetablePreferencesStore.getState().cellAppearance;
		return toMerged(base, defaultValues!);
	}, [defaultValues]);

	const form = useForm<CellAppearance>({
		resolver: zodResolver(CellAppearanceSchema),
		defaultValues: createDefaultValues,
	});

	// Update form when controlled value changes (value prop changes)
	useEffect(() => {
		if (value && !isEqual(value, form.getValues())) {
			form.reset(createDefaultValues);
		}
	}, [value, createDefaultValues, form]);

	// Subscribe to form changes and call onChange (internal form changes)
	useEffect(() => {
		if (onChange && value !== undefined) {
			const unsub = form.subscribe({
				formState: {
					values: true,
				},
				callback: ({ values }) => {
					if (values && !isEqual(values, value)) {
						const dirtyValues = getDirtyValues(
							form.formState.dirtyFields,
							values,
						);
						onChange(dirtyValues);
					}
				},
			});

			return unsub;
		}
	}, [form.subscribe, form.formState.dirtyFields, onChange, value]);

	const textAlignOptions: { value: TextAlign; label: string }[] = [
		{ value: "left", label: "Left" },
		{ value: "center", label: "Center" },
		{ value: "right", label: "Right" },
	];

	const handleSubmit = (data: CellAppearance) => {
		const dirtyValues = getDirtyValues(form.formState.dirtyFields, data);
		onSubmit?.(dirtyValues);
	};

	// When used in controlled mode (with onChange), don't render a form wrapper
	const isControlled = onChange !== undefined;

	let formContent = (
		<div className="space-y-6">
			<FormField
				control={form.control}
				name="textAlign"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Text Alignment</FormLabel>
						<FormControl>
							<div className="flex gap-2">
								{textAlignOptions.map((option) => (
									<Button
										key={option.value}
										type="button"
										variant={
											field.value === option.value ? "default" : "outline"
										}
										onClick={() => field.onChange(option.value)}
									>
										{option.label}
									</Button>
								))}
							</div>
						</FormControl>
						<FormDescription>
							Choose how text is aligned within the course cell
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="space-y-3">
				<div>
					<Label className="text-sm font-medium">Element Settings</Label>
					<p className="text-xs text-muted-foreground">
						Configure font weight, size, and visibility for each element
					</p>
				</div>
				<ElementRow name="Code" elementKey="code" form={form} />
				<ElementRow name="Course Name" elementKey="name" form={form} />
				<ElementRow name="Time" elementKey="time" form={form} />
				<ElementRow name="Location" elementKey="location" form={form} />
			</div>
		</div>
	);

	// In controlled mode, just render the form fields without a form wrapper
	if (!isControlled) {
		formContent = (
			<form onSubmit={form.handleSubmit(handleSubmit)}>{formContent}</form>
		);
	}

	return <Form {...form}>{formContent}</Form>;
}
