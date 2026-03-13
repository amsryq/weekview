import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Eye,
	EyeOff,
	Type,
} from "lucide-react";
import type { PartialDeep } from "type-fest";
import type { CourseFormApi } from "~/lib/contexts/course-editor";
import type {
	CellAppearance,
	CellElements,
	FontWeight,
	TextAlign,
} from "~/lib/models/cell-appearance";
import { PREDEFINED_FONTS } from "~/lib/utils/fonts";
import { cn } from "~/lib/utils/styles";
import { PaywallOverlay } from "../paywall-overlay";
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
			{process.env.NODE_ENV === "development" && (
				<PaywallOverlay compact bypass className="rounded-lg">
					<Section title="Material">
						<SmartField<"basic" | "glass">
							form={form}
							name={`${namePrefix}.material`}
							value={value?.material}
							baseValue={base.material}
							fallback="basic"
							onChange={(v) => onChange?.({ material: v })}
						>
							{(val, set) => (
								<Field label="Surface style">
									<MaterialPicker value={val} onChange={set} />
								</Field>
							)}
						</SmartField>
					</Section>
				</PaywallOverlay>
			)}

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

						<div className="grid gap-3">
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
																onToggleVisibility={() => setVisible(!visible)}
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
	value: "basic" | "glass";
	onChange: (v: "basic" | "glass") => void;
}) {
	return (
		<div className="inline-flex rounded-md border p-0.5 gap-0.5">
			{(["basic", "glass"] as const).map((v) => (
				<button
					key={v}
					type="button"
					onClick={() => onChange(v)}
					className={cn(
						"px-3 py-1 text-xs rounded capitalize transition-colors",
						value === v
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:text-foreground hover:bg-muted",
					)}
				>
					{v}
				</button>
			))}
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
