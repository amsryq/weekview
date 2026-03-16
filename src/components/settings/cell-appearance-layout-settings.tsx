import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Cloud,
	Eye,
	EyeOff,
	Layers,
	Square,
	Type,
} from "lucide-react";
import type { PartialDeep } from "type-fest";
import type { CourseFormApi } from "~/lib/contexts/course-editor";
import {
	type CellAppearance,
	type CellElements,
	type CellMaterial,
	DEFAULT_BLUR_OPTIONS,
	DEFAULT_GLASS_OPTIONS,
	type FontWeight,
	type TextAlign,
} from "~/lib/models/cell-appearance";
import { PREDEFINED_FONTS } from "~/lib/utils/fonts";
import { cn } from "~/lib/utils/styles";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "../ui/hover-card";
import { Label } from "../ui/label";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";

const IS_FIREFOX =
	typeof window !== "undefined" && /Firefox/.test(navigator.userAgent);

interface Props {
	value?: CellAppearance;
	baseValues?: Partial<CellAppearance>;
	onChange?: (changes: PartialDeep<CellAppearance>) => void;
	form?: CourseFormApi;
	namePrefix?: string;
}

type ElementKey = CellElements;

const CELL_ELEMENTS: readonly ElementKey[] = [
	"code",
	"name",
	"time",
	"location",
];

const ELEMENT_LABELS: Record<ElementKey, string> = {
	code: "Code",
	name: "Name",
	time: "Time",
	location: "Location",
};

export function CellAppearanceLayoutSettings({
	value,
	baseValues,
	onChange,
	form,
	namePrefix = "cellAppearance",
}: Props) {
	const base = baseValues ?? {};

	return (
		<div className="space-y-6">
			{/* Shape */}
			<Section title="Shape">
				<SmartField<number>
					form={form}
					name={`${namePrefix}.borderRadius`}
					value={value?.borderRadius}
					baseValue={base.borderRadius}
					fallback={8}
					onChange={(v) => onChange?.({ borderRadius: v })}
				>
					{(val, set) => (
						<Field label="Corner radius">
							<div className="flex items-center gap-3">
								<Slider
									className="w-32"
									min={0}
									max={24}
									step={1}
									value={[val]}
									onValueChange={([r]) => set(r)}
								/>
								<span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
									{val}px
								</span>
							</div>
						</Field>
					)}
				</SmartField>

				<SmartField<TextAlign>
					form={form}
					name={`${namePrefix}.textAlign`}
					value={value?.textAlign}
					baseValue={base.textAlign}
					fallback="center"
					onChange={(v) => onChange?.({ textAlign: v })}
				>
					{(val, set) => (
						<Field label="Text alignment">
							<AlignmentPicker value={val} onChange={set} />
						</Field>
					)}
				</SmartField>
			</Section>

			{/* Material */}
			<Section title="Material">
				<SmartField<CellMaterial>
					form={form}
					name={`${namePrefix}.material`}
					value={value?.material}
					baseValue={base.material}
					fallback="basic"
					onChange={(v) => onChange?.({ material: v })}
				>
					{(val, set) => (
						<div className="space-y-4">
							<Field label="Surface style">
								<MaterialPicker value={val} onChange={set} />
							</Field>

							{val !== "basic" && (
								<div className="space-y-4 pt-1">
									<SmartField<number>
										form={form}
										name={
											val === "glass"
												? `${namePrefix}.glassOptions.opacity`
												: `${namePrefix}.blurOptions.opacity`
										}
										value={
											val === "glass"
												? value?.glassOptions?.opacity
												: value?.blurOptions?.opacity
										}
										baseValue={
											val === "glass"
												? base.glassOptions?.opacity
												: base.blurOptions?.opacity
										}
										fallback={
											val === "glass"
												? DEFAULT_GLASS_OPTIONS.opacity
												: DEFAULT_BLUR_OPTIONS.opacity
										}
										onChange={(v) =>
											onChange?.(
												val === "glass"
													? { glassOptions: { opacity: v } }
													: { blurOptions: { opacity: v } },
											)
										}
									>
										{(opacityVal, setOpacity) => (
											<Field label="Opacity">
												<div className="flex items-center gap-3">
													<Slider
														className="w-32"
														min={0}
														max={1}
														step={0.01}
														value={[opacityVal]}
														onValueChange={([v]) => setOpacity(v)}
														disabled={val === "glass" && IS_FIREFOX}
													/>
													<span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
														{Math.round(opacityVal * 100)}%
													</span>
												</div>
											</Field>
										)}
									</SmartField>

									<SmartField<number>
										form={form}
										name={
											val === "glass"
												? `${namePrefix}.glassOptions.blur`
												: `${namePrefix}.blurOptions.blur`
										}
										value={
											val === "glass"
												? value?.glassOptions?.blur
												: value?.blurOptions?.blur
										}
										baseValue={
											val === "glass"
												? base.glassOptions?.blur
												: base.blurOptions?.blur
										}
										fallback={
											val === "glass"
												? DEFAULT_GLASS_OPTIONS.blur
												: DEFAULT_BLUR_OPTIONS.blur
										}
										onChange={(v) =>
											onChange?.(
												val === "glass"
													? { glassOptions: { blur: v } }
													: { blurOptions: { blur: v } },
											)
										}
									>
										{(blurVal, setBlur) => (
											<Field label="Blur">
												<div className="flex items-center gap-3">
													<Slider
														className="w-32"
														min={0}
														max={40}
														step={1}
														value={[blurVal]}
														onValueChange={([v]) => setBlur(v)}
														disabled={val === "glass" && IS_FIREFOX}
													/>
													<span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
														{blurVal}px
													</span>
												</div>
											</Field>
										)}
									</SmartField>
								</div>
							)}
						</div>
					)}
				</SmartField>
			</Section>

			{/* Typography */}
			<SmartField<boolean>
				form={form}
				name={`${namePrefix}.autoSizeFont`}
				value={value?.autoSizeFont}
				baseValue={base.autoSizeFont}
				fallback={true}
				onChange={(v) => onChange?.({ autoSizeFont: v })}
			>
				{(autoSize, setAutoSize) => (
					<Section
						title="Typography"
						action={
							<div className="flex items-center gap-2">
								<Label
									htmlFor="auto-size"
									className="text-xs text-muted-foreground"
								>
									Auto-size
								</Label>
								<Switch
									id="auto-size"
									checked={autoSize}
									onCheckedChange={setAutoSize}
								/>
							</div>
						}
					>
						<SmartField<string>
							form={form}
							name={`${namePrefix}.fontFamily`}
							value={value?.fontFamily}
							baseValue={base.fontFamily}
							fallback="Inter"
							onChange={(v) => onChange?.({ fontFamily: v })}
						>
							{(fontFamily, setFontFamily) => (
								<Field label="Font family">
									<Select value={fontFamily} onValueChange={setFontFamily}>
										<SelectTrigger className="w-52">
											<SelectValue placeholder="Select font" />
										</SelectTrigger>
										<SelectContent>
											{PREDEFINED_FONTS.map((font) => (
												<SelectItem key={font} value={font}>
													<span style={{ fontFamily: `'${font}', sans-serif` }}>
														{font}
													</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</SmartField>

						<div className="overflow-x-auto -mx-1 px-1 pb-1">
							<div className="grid gap-3 w-max min-w-full">
								{CELL_ELEMENTS.map((element) => (
									<div key={element} className="contents">
										<SmartField<boolean>
											form={form}
											name={`${namePrefix}.visibility.${element}`}
											value={value?.visibility?.[element]}
											baseValue={base.visibility?.[element]}
											fallback={true}
											onChange={(v) =>
												onChange?.({ visibility: { [element]: v } })
											}
										>
											{(visible, setVisible) => (
												<SmartField<number>
													form={form}
													name={`${namePrefix}.fontSize.${element}`}
													value={value?.fontSize?.[element]}
													baseValue={base.fontSize?.[element]}
													fallback={12}
													onChange={(v) =>
														onChange?.({ fontSize: { [element]: v } })
													}
												>
													{(size, setSize) => (
														<SmartField<FontWeight>
															form={form}
															name={`${namePrefix}.weight.${element}`}
															value={value?.weight?.[element]}
															baseValue={base.weight?.[element]}
															fallback="normal"
															onChange={(v) =>
																onChange?.({ weight: { [element]: v } })
															}
														>
															{(weight, setWeight) => (
																<ElementRow
																	label={ELEMENT_LABELS[element]}
																	visible={visible}
																	fontSize={size}
																	fontWeight={weight}
																	showSizeControl={!autoSize}
																	onToggleVisibility={() =>
																		setVisible(!visible)
																	}
																	onFontSizeChange={setSize}
																	onFontWeightChange={setWeight}
																/>
															)}
														</SmartField>
													)}
												</SmartField>
											)}
										</SmartField>
									</div>
								))}
							</div>
						</div>
					</Section>
				)}
			</SmartField>
		</div>
	);
}

function SmartField<T>({
	form,
	name,
	value,
	baseValue,
	fallback,
	onChange,
	children,
}: {
	form?: CourseFormApi;
	name: string;
	value?: T;
	baseValue?: T;
	fallback: T;
	onChange?: (v: T) => void;
	children: (val: T, set: (v: T) => void) => React.ReactNode;
}) {
	if (form) {
		return (
			<form.Field
				// biome-ignore lint/suspicious/noExplicitAny: TanStack Form path types are extremely complex to map dynamically
				name={name as any}
			>
				{(field) =>
					children(
						(field.state.value ?? baseValue ?? fallback) as T,
						// biome-ignore lint/suspicious/noExplicitAny: Internal bridge for generic form updates
						(v: T) => field.handleChange(v as any),
					)
				}
			</form.Field>
		);
	}

	return children(
		(value ?? baseValue ?? fallback) as T,
		onChange ??
			(() => {
				/* no-op */
			}),
	);
}

function Section({
	title,
	action,
	children,
}: {
	title: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium">{title}</h4>
				{action}
			</div>
			<div className="space-y-3">{children}</div>
		</section>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between">
			<Label className="text-sm text-muted-foreground">{label}</Label>
			{children}
		</div>
	);
}

function AlignmentPicker({
	value,
	onChange,
}: {
	value: TextAlign;
	onChange: (v: TextAlign) => void;
}) {
	const options: { value: TextAlign; icon: typeof AlignLeft }[] = [
		{ value: "left", icon: AlignLeft },
		{ value: "center", icon: AlignCenter },
		{ value: "right", icon: AlignRight },
	];

	return (
		<div className="inline-flex rounded-md border p-0.5 gap-0.5">
			{options.map(({ value: v, icon: Icon }) => (
				<button
					key={v}
					type="button"
					onClick={() => onChange(v)}
					className={cn(
						"p-1.5 rounded transition-colors",
						value === v
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:text-foreground hover:bg-muted",
					)}
				>
					<Icon className="size-4" />
				</button>
			))}
		</div>
	);
}

function MaterialPicker({
	value,
	onChange,
}: {
	value: CellMaterial;
	onChange: (v: CellMaterial) => void;
}) {
	const options: { value: CellMaterial; icon: typeof Square; label: string }[] =
		[
			{ value: "basic", icon: Square, label: "Basic" },
			{ value: "blur", icon: Cloud, label: "Blur" },
			{ value: "glass", icon: Layers, label: "Glass" },
		];

	return (
		<div className="inline-flex rounded-md border p-0.5 gap-0.5">
			{options.map(({ value: v, icon: Icon, label }) => {
				const isDisabled = v === "glass" && IS_FIREFOX;
				const button = (
					<button
						key={v}
						type="button"
						disabled={isDisabled}
						onClick={() => onChange(v)}
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors",
							value === v
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground hover:bg-muted",
							isDisabled && "opacity-40 cursor-not-allowed",
						)}
					>
						<Icon className="size-3.5" />
						<span className="text-xs font-medium">{label}</span>
					</button>
				);

				if (isDisabled) {
					return (
						<HoverCard key={v} openDelay={200}>
							<HoverCardTrigger asChild>{button}</HoverCardTrigger>
							<HoverCardContent className="w-48 p-3 text-xs">
								Glass material is currently unavailable on Firefox as it doesn't
								support some required filter features.
							</HoverCardContent>
						</HoverCard>
					);
				}

				return button;
			})}
		</div>
	);
}

function ElementRow({
	label,
	visible,
	fontSize,
	fontWeight,
	showSizeControl,
	onToggleVisibility,
	onFontSizeChange,
	onFontWeightChange,
}: {
	label: string;
	visible: boolean;
	fontSize: number;
	fontWeight: FontWeight;
	showSizeControl: boolean;
	onToggleVisibility: () => void;
	onFontSizeChange: (size: number) => void;
	onFontWeightChange: (weight: FontWeight) => void;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg border px-3 py-2 transition-opacity",
				!visible && "opacity-40",
			)}
		>
			{/* Visibility toggle */}
			<button
				type="button"
				onClick={onToggleVisibility}
				className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
			>
				{visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
			</button>

			{/* Label */}
			<span className="text-sm font-medium w-16">{label}</span>

			{/* Weight picker */}
			<WeightPicker
				value={fontWeight}
				onChange={onFontWeightChange}
				disabled={!visible}
			/>

			{/* Size control */}
			{showSizeControl && (
				<div className="ml-auto flex items-center gap-2">
					<Type className="size-3.5 text-muted-foreground" />
					<Slider
						className="w-20"
						min={8}
						max={24}
						step={1}
						value={[fontSize]}
						onValueChange={([s]) => onFontSizeChange(s)}
						disabled={!visible}
					/>
					<span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
						{fontSize}
					</span>
				</div>
			)}
		</div>
	);
}

function WeightPicker({
	value,
	onChange,
	disabled,
}: {
	value: FontWeight;
	onChange: (v: FontWeight) => void;
	disabled?: boolean;
}) {
	const weights: { value: FontWeight; label: string }[] = [
		{ value: "light", label: "Light" },
		{ value: "normal", label: "Regular" },
		{ value: "bold", label: "Bold" },
	];

	return (
		<div className="inline-flex rounded-md border p-0.5 gap-0.5">
			{weights.map(({ value: w, label }) => (
				<button
					key={w}
					type="button"
					disabled={disabled}
					onClick={() => onChange(w)}
					className={cn(
						"px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50 disabled:pointer-events-none",
						value === w
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:text-foreground hover:bg-muted",
					)}
				>
					{label}
				</button>
			))}
		</div>
	);
}
