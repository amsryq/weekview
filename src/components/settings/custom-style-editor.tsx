import { Moon, Sun, Trash2 } from "lucide-react";
import { memo, useCallback, useEffect, useId, useState } from "react";
import { useStore } from "zustand";
import { useTheme } from "~/lib/contexts/themes";
import {
	DEFAULT_TIMETABLE_STYLE_ID,
	isBuiltInStyle,
	type TimetableColorMode,
	type TimetableStyle,
} from "~/lib/models/style";
import { CourseStore } from "~/lib/stores/course-store";
import { CustomStylesStore } from "~/lib/stores/custom-styles-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { PREDEFINED_FONTS } from "~/lib/utils/fonts";
import { cn } from "~/lib/utils/styles";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ColorEntryConfigurer } from "./color-entry-configurer";

interface CustomStyleEditorDialogProps {
	styleId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface VariantEditorProps {
	mode: TimetableColorMode;
	styleId: string;
}

const CHROME_FIELDS = [
	{ key: "labelColor", label: "Day labels" },
	{ key: "timeColor", label: "Times" },
	{ key: "gridLineColor", label: "Grid lines" },
] as const;

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function getCustomStyle(
	state: {
		styles: TimetableStyle[];
	},
	styleId: string | null,
) {
	if (!styleId) return null;
	return state.styles.find((item) => item.id === styleId) ?? null;
}

function normalizeHexColor(value: string): string | null {
	const trimmed = value.trim();
	if (!HEX_COLOR_REGEX.test(trimmed)) {
		return null;
	}

	if (trimmed.length === 4) {
		const [r, g, b] = trimmed.slice(1);
		return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
	}

	return trimmed.toLowerCase();
}

export function CustomStyleEditorDialog({
	styleId,
	open,
	onOpenChange,
}: CustomStyleEditorDialogProps) {
	const styleExists = useStore(
		CustomStylesStore,
		useCallback((state) => getCustomStyle(state, styleId) !== null, [styleId]),
	);
	const styleName = useStore(
		CustomStylesStore,
		useCallback(
			(state) => getCustomStyle(state, styleId)?.name ?? "",
			[styleId],
		),
	);
	const styleFontFamily = useStore(
		CustomStylesStore,
		useCallback(
			(state) =>
				getCustomStyle(state, styleId)?.fontFamily ?? PREDEFINED_FONTS[0],
			[styleId],
		),
	);
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(state) => state.activeStyleId,
	);
	const currentTheme = useTheme().applyingTheme;

	const isOpen = open && !!styleId && styleExists && !isBuiltInStyle(styleId);

	const handleDelete = useCallback(() => {
		if (!styleId) return;
		if (activeStyleId === styleId) {
			TimetablePreferencesStore.getState().applyStyle(
				DEFAULT_TIMETABLE_STYLE_ID,
			);
			CourseStore.getState().resetAllToStyle(DEFAULT_TIMETABLE_STYLE_ID);
		}
		CustomStylesStore.getState().deleteStyle(styleId);
		onOpenChange(false);
	}, [activeStyleId, onOpenChange, styleId]);

	if (!styleId) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl gap-0 overflow-hidden p-0 sm:max-h-[88vh]">
				<div className="flex h-[88vh] max-h-[88vh] min-h-155 flex-col bg-background max-sm:h-[95vh] max-sm:max-h-[95vh] max-sm:min-h-0">
					<DialogHeader className="border-b bg-linear-to-b from-muted/40 to-background px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
						<div className="space-y-1.5">
							<DialogTitle>Edit Style</DialogTitle>
							<DialogDescription>
								Customize typography, chrome colors, and automatic palette
								behavior.
							</DialogDescription>
						</div>
						<div className="flex justify-end mt-2">
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="gap-2"
									>
										<Trash2 className="size-4" />
										<span className="max-sm:hidden">Delete</span>
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Delete style?</AlertDialogTitle>
										<AlertDialogDescription>
											This permanently removes your custom style from this
											browser.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={handleDelete}>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>

						<div className="grid gap-3 pt-4 md:grid-cols-[minmax(0,1fr)_280px]">
							<div className="space-y-2">
								<Label htmlFor="custom-style-name">Style name</Label>
								<Input
									id="custom-style-name"
									value={styleName}
									onChange={(event) =>
										CustomStylesStore.getState().updateStyleMeta(styleId, {
											name: event.target.value,
										})
									}
									placeholder="My style"
								/>
							</div>
							<div className="space-y-2">
								<Label>Font family</Label>
								<Select
									value={styleFontFamily}
									onValueChange={(value) =>
										CustomStylesStore.getState().updateStyleMeta(styleId, {
											fontFamily: value,
										})
									}
								>
									<SelectTrigger className="h-11 w-full">
										<SelectValue placeholder="Select font" />
									</SelectTrigger>
									<SelectContent>
										{PREDEFINED_FONTS.map((font) => (
											<SelectItem key={font} value={font} className="py-2.5">
												<span style={{ fontFamily: `'${font}', sans-serif` }}>
													{font}
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</DialogHeader>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
						<Tabs defaultValue={currentTheme} className="space-y-4">
							<TabsList className="grid w-full grid-cols-2 sm:w-60">
								<TabsTrigger value="light" className="gap-2">
									<Sun className="size-4" />
									Light
								</TabsTrigger>
								<TabsTrigger value="dark" className="gap-2">
									<Moon className="size-4" />
									Dark
								</TabsTrigger>
							</TabsList>
							<TabsContent value="light" className="m-0">
								<VariantEditor mode="light" styleId={styleId} />
							</TabsContent>
							<TabsContent value="dark" className="m-0">
								<VariantEditor mode="dark" styleId={styleId} />
							</TabsContent>
						</Tabs>
					</div>

					<DialogFooter className="border-t px-4 py-3 sm:px-6 sm:py-4">
						<Button type="button" onClick={() => onOpenChange(false)}>
							Done
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function VariantEditor({ mode, styleId }: VariantEditorProps) {
	const styleExists = useStore(
		CustomStylesStore,
		useCallback((state) => getCustomStyle(state, styleId) !== null, [styleId]),
	);

	if (!styleExists) {
		return null;
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="grid gap-4 sm:gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
				<section className="rounded-xl border bg-card/60 p-4 shadow-sm sm:p-5">
					<BackgroundColorField styleId={styleId} mode={mode} />
				</section>

				<section className="space-y-3 rounded-xl border bg-card/60 p-4 shadow-sm sm:p-5">
					<div>
						<h4 className="text-sm font-medium">Chrome</h4>
						<p className="text-xs text-muted-foreground">
							These colors control the grid labels and timetable frame.
						</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{CHROME_FIELDS.map((field) => (
							<ChromeColorField
								key={field.key}
								styleId={styleId}
								mode={mode}
								fieldKey={field.key}
								label={field.label}
							/>
						))}
					</div>
				</section>
			</div>

			<section className="space-y-3 rounded-xl border bg-card/60 p-4 shadow-sm sm:p-5">
				<div>
					<h4 className="text-sm font-medium">Palette</h4>
					<p className="text-xs text-muted-foreground">
						These 10 colors are used for automatic course assignments in this
						style.
					</p>
				</div>
				<div className="grid gap-4 xl:grid-cols-2">
					{Array.from({ length: 10 }, (_, index) => (
						<PaletteColorCard
							key={`${mode}-${index}`}
							index={index}
							mode={mode}
							styleId={styleId}
						/>
					))}
				</div>
			</section>
		</div>
	);
}

interface BackgroundColorFieldProps {
	mode: TimetableColorMode;
	styleId: string;
}

const BackgroundColorField = memo(function BackgroundColorField({
	mode,
	styleId,
}: BackgroundColorFieldProps) {
	const value = useStore(
		CustomStylesStore,
		useCallback(
			(state) =>
				getCustomStyle(state, styleId)?.variants[mode].background.color ??
				"#000000",
			[mode, styleId],
		),
	);

	const onChange = useCallback(
		(nextValue: string) => {
			CustomStylesStore.getState().updateVariantBackground(
				styleId,
				mode,
				nextValue,
			);
		},
		[mode, styleId],
	);

	return (
		<div className="space-y-3">
			<div>
				<h4 className="text-sm font-medium">Background</h4>
				<p className="text-xs text-muted-foreground">
					Sets the canvas color behind your timetable grid.
				</p>
			</div>
			<ColorField label="Canvas color" value={value} onChange={onChange} />
		</div>
	);
});

interface ChromeColorFieldProps {
	mode: TimetableColorMode;
	styleId: string;
	fieldKey: (typeof CHROME_FIELDS)[number]["key"];
	label: string;
}

const ChromeColorField = memo(function ChromeColorField({
	mode,
	styleId,
	fieldKey,
	label,
}: ChromeColorFieldProps) {
	const value = useStore(
		CustomStylesStore,
		useCallback(
			(state) =>
				getCustomStyle(state, styleId)?.variants[mode].chrome[fieldKey] ??
				"#000000",
			[fieldKey, mode, styleId],
		),
	);

	const onChange = useCallback(
		(nextValue: string) => {
			CustomStylesStore.getState().updateVariantChrome(
				styleId,
				mode,
				fieldKey,
				nextValue,
			);
		},
		[fieldKey, mode, styleId],
	);

	return <ColorField label={label} value={value} onChange={onChange} />;
});

interface PaletteColorCardProps {
	index: number;
	mode: TimetableColorMode;
	styleId: string;
}

const PaletteColorCard = memo(function PaletteColorCard({
	index,
	mode,
	styleId,
}: PaletteColorCardProps) {
	const value = useStore(
		CustomStylesStore,
		useCallback(
			(state) =>
				getCustomStyle(state, styleId)?.variants[mode].gridColors[index] ??
				null,
			[index, mode, styleId],
		),
	);

	const onChange = useCallback(
		(nextValue: NonNullable<typeof value>) => {
			CustomStylesStore.getState().updateVariantGridColor(
				styleId,
				mode,
				index,
				nextValue,
			);
		},
		[index, mode, styleId],
	);

	if (!value) {
		return null;
	}

	return (
		<div className="rounded-xl border bg-background/80 p-4 shadow-sm transition-colors hover:bg-muted/20 [content-visibility:auto]">
			<div className="mb-4">
				<p className="text-sm font-medium">Palette color {index + 1}</p>
				<p className="text-xs text-muted-foreground">
					Used when assigning colors automatically.
				</p>
			</div>
			<ColorEntryConfigurer value={value} onChange={onChange} />
		</div>
	);
});

interface ColorFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

const ColorField = memo(function ColorField({
	label,
	value,
	onChange,
}: ColorFieldProps) {
	const textInputId = useId();
	const [draftValue, setDraftValue] = useState(value);

	useEffect(() => {
		setDraftValue(value);
	}, [value]);

	const safePickerValue = normalizeHexColor(value) ?? "#000000";
	const isDraftValid = normalizeHexColor(draftValue) !== null;

	const commitDraft = useCallback(() => {
		const normalized = normalizeHexColor(draftValue);
		if (!normalized) {
			setDraftValue(value);
			return;
		}

		if (normalized !== value) {
			onChange(normalized);
		}
		setDraftValue(normalized);
	}, [draftValue, onChange, value]);

	return (
		<div className="space-y-2">
			<Label htmlFor={textInputId}>{label}</Label>
			<div className="flex items-center gap-2.5">
				<Input
					type="color"
					value={safePickerValue}
					onChange={(event) => {
						setDraftValue(event.target.value);
						onChange(event.target.value);
					}}
					className="h-11 w-14 cursor-pointer rounded-lg p-1"
				/>
				<div
					className="size-4 shrink-0 rounded-full border border-border/80"
					style={{ backgroundColor: safePickerValue }}
				/>
				<Input
					id={textInputId}
					type="text"
					value={draftValue}
					onChange={(event) => setDraftValue(event.target.value)}
					onBlur={commitDraft}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							commitDraft();
						}
					}}
					className={cn(
						"font-mono uppercase",
						!isDraftValid && "border-destructive/60",
					)}
					placeholder="#000000"
				/>
			</div>
		</div>
	);
});
