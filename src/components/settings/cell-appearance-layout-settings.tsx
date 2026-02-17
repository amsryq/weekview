
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Eye,
	EyeOff,
	Type,
} from "lucide-react";
import type { PartialDeep } from "type-fest";
import type {
	CellAppearance,
	CellElements,
	FontWeight,
	TextAlign,
} from "~/lib/models/cell-appearance";
import { cn } from "~/lib/utils/styles";
import { PaywallOverlay } from "../paywall-overlay";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";

interface Props {
	value: CellAppearance;
	baseValues?: Partial<CellAppearance>;
	onChange: (changes: PartialDeep<CellAppearance>) => void;
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
}: Props) {
	const base = baseValues ?? {};

	const get = <K extends keyof CellAppearance>(
		key: K,
		fallback: NonNullable<CellAppearance[K]>,
	): NonNullable<CellAppearance[K]> => value[key] ?? base[key] ?? fallback;

	const borderRadius = get("borderRadius", 8);
	const textAlign = get("textAlign", "center");
	const autoSize = get("autoSizeFont", true);

	const getElementProp = <T,>(
		prop: "visibility" | "fontSize" | "weight",
		element: ElementKey,
		fallback: T,
	): T => {
		const fromValue = value[prop]?.[element];
		const fromBase = base[prop]?.[element as keyof (typeof base)[typeof prop]];
		return (fromValue ?? fromBase ?? fallback) as T;
	};

	return (
		<div className="space-y-6">
			{/* Shape */}
			<Section title="Shape">
				<Field label="Corner radius">
					<div className="flex items-center gap-3">
						<Slider
							className="w-32"
							min={0}
							max={24}
							step={1}
							value={[borderRadius]}
							onValueChange={([r]) => onChange({ borderRadius: r })}
						/>
						<span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
							{borderRadius}px
						</span>
					</div>
				</Field>

				<Field label="Text alignment">
					<AlignmentPicker
						value={textAlign}
						onChange={(v) => onChange({ textAlign: v })}
					/>
				</Field>
			</Section>

			{/* Material */}
			{process.env.NODE_ENV === "development" && (
				<PaywallOverlay compact bypass className="rounded-lg">
					<Section title="Material">
						<Field label="Surface style">
							<MaterialPicker
								value={get("material", "basic")}
								onChange={(v) => onChange({ material: v })}
							/>
						</Field>
					</Section>
				</PaywallOverlay>
			)}

			{/* Typography */}
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
							onCheckedChange={(v) => onChange({ autoSizeFont: v })}
						/>
					</div>
				}
			>
				<div className="grid gap-3">
					{CELL_ELEMENTS.map((element) => {
						const visible = getElementProp("visibility", element, true);
						const size = getElementProp("fontSize", element, 12);
						const weight = getElementProp(
							"weight",
							element,
							"normal" as FontWeight,
						);

						return (
							<ElementRow
								key={element}
								label={ELEMENT_LABELS[element]}
								visible={visible}
								fontSize={size}
								fontWeight={weight}
								showSizeControl={!autoSize}
								onToggleVisibility={() =>
									onChange({ visibility: { [element]: !visible } })
								}
								onFontSizeChange={(s) =>
									onChange({ fontSize: { [element]: s } })
								}
								onFontWeightChange={(w) =>
									onChange({ weight: { [element]: w } })
								}
							/>
						);
					})}
				</div>
			</Section>
		</div>
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
