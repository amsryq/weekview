import { useStore as useFormStore } from "@tanstack/react-form";
import {
	ChevronDown,
	ChevronRight,
	Settings,
	Smile,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "zustand";
import { useCourseEditorForm } from "~/lib/contexts/course-editor";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { PREDEFINED_FONTS } from "~/lib/utils/fonts";
import { resolveTimetableStyle } from "~/lib/utils/timetable-styles";
import { cn } from "~/lib/utils/styles";
import { PaywallOverlay } from "../paywall-overlay";
import { ColorSelectorGrid } from "../settings/color-selector-grid";
import { Button } from "../ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "../ui/collapsible";
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "../ui/emoji-picker";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { Twemoji } from "../ui/twemoji";

export function AppearanceTab({
	showIcon = true,
	showOnlyIcon = false,
}: {
	showIcon?: boolean;
	showOnlyIcon?: boolean;
}) {
	const form = useCourseEditorForm();
	const [iconSettingsOpen, setIconSettingsOpen] = useState(false);

	// Watch all icon-related fields at the top level to avoid conditional hook usage
	const iconType = useFormStore(
		form.store,
		(s) => s.values.cellAppearance?.icon?.type,
	);
	const iconEmoji = useFormStore(
		form.store,
		(s) => s.values.cellAppearance?.icon?.emoji,
	);
	const iconSvg = useFormStore(
		form.store,
		(s) => s.values.cellAppearance?.icon?.svg,
	);
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(s) => s.activeStyleId,
	);
	const style = resolveTimetableStyle(activeStyleId);

	const hasIcon =
		iconType &&
		((iconType === "emoji" && iconEmoji && iconEmoji.trim() !== "") ||
			(iconType === "svg" && iconSvg && iconSvg.trim() !== ""));

	if (showOnlyIcon) {
		return (
			<IconSection
				form={form}
				iconType={iconType}
				iconEmoji={iconEmoji}
				iconSettingsOpen={iconSettingsOpen}
				setIconSettingsOpen={setIconSettingsOpen}
				hasIcon={!!hasIcon}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Colors Section */}
			<Section title="Colors">
				<form.Field name="cellAppearance.background">
					{(field) => (
						<Field label="Background">
							<div className="flex flex-col gap-2">
								<ColorSelectorGrid
									value={field.state.value}
									onChange={(value) => {
										field.handleChange(value);
										form.setFieldValue(
											"themeColorIndex",
											null as unknown as number,
										);
									}}
								/>
							</div>
						</Field>
					)}
				</form.Field>

				<form.Field name="cellAppearance.fgColor">
					{(field) => (
						<Field label="Text Color">
							<div className="flex items-center gap-2">
								<Input
									type="color"
									className="w-10 h-8 p-1 rounded border cursor-pointer shrink-0"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
								<Input
									placeholder="#ffffff"
									className="flex-1 h-8 font-mono text-xs"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							</div>
						</Field>
					)}
				</form.Field>
			</Section>

			<Section title="Typography">
				<form.Field name="cellAppearance.fontFamily">
					{(field) => (
						<Field label="Font">
							<Select
								onValueChange={field.handleChange}
								value={field.state.value ?? style.fontFamily}
							>
								<SelectTrigger className="h-8 text-xs w-48">
									<SelectValue placeholder="Select font" />
								</SelectTrigger>
								<SelectContent>
									{PREDEFINED_FONTS.map((font) => (
										<SelectItem key={font} value={font} className="text-xs">
											<span style={{ fontFamily: `'${font}', sans-serif` }}>
												{font}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					)}
				</form.Field>
			</Section>

			{/* Icon Section */}
			{showIcon && (
				<IconSection
					form={form}
					iconType={iconType}
					iconEmoji={iconEmoji}
					iconSettingsOpen={iconSettingsOpen}
					setIconSettingsOpen={setIconSettingsOpen}
					hasIcon={!!hasIcon}
				/>
			)}
		</div>
	);
}

function IconSection({
	form,
	iconType,
	iconEmoji,
	iconSettingsOpen,
	setIconSettingsOpen,
	hasIcon,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	form: any;
	iconType: any;
	iconEmoji: any;
	iconSettingsOpen: boolean;
	setIconSettingsOpen: (v: boolean) => void;
	hasIcon: boolean;
}) {
	return (
		<PaywallOverlay
			title="Premium Feature"
			description="Icons are available for supporters only."
			className="rounded-xl"
		>
			<Section title="Icon">
				<form.Field name="cellAppearance.icon.type">
					{(field: any) => (
						<Field label="Icon Type">
							<Select
								onValueChange={(v) => field.handleChange(v as "emoji" | "svg")}
								value={field.state.value}
							>
								<SelectTrigger className="h-8 text-xs w-40">
									<SelectValue placeholder="Choose icon type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="emoji" className="text-xs">
										Emoji
									</SelectItem>
									<SelectItem value="svg" className="text-xs">
										Custom SVG
									</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					)}
				</form.Field>

				{/* Emoji Input */}
				{iconType === "emoji" && (
					<form.Field name="cellAppearance.icon.emoji">
						{(field: any) => (
							<Field label="Emoji">
								<div className="flex items-center gap-2">
									<Popover modal={true}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="h-8 px-2 text-lg bg-muted/50 hover:bg-muted/70"
											>
												{field.state.value ? (
													<Twemoji
														emoji={field.state.value}
														className="text-lg leading-0"
													/>
												) : (
													<Smile className="size-4" />
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-fit p-0" align="start">
											<EmojiPicker
												className="h-[342px]"
												onEmojiSelect={({ emoji }: { emoji: string }) => {
													field.handleChange(emoji);
												}}
											>
												<EmojiPickerSearch />
												<EmojiPickerContent />
												<EmojiPickerFooter />
											</EmojiPicker>
										</PopoverContent>
									</Popover>
									{field.state.value && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => field.handleChange("")}
											className="h-6 w-6 p-0 hover:text-destructive text-foreground"
										>
											×
										</Button>
									)}
								</div>
							</Field>
						)}
					</form.Field>
				)}

				{/* SVG Input */}
				{iconType === "svg" && (
					<form.Field name="cellAppearance.icon.svg">
						{(field: any) => (
							<Field label="SVG Code">
								<div className="space-y-4 w-full">
									<Textarea
										placeholder={`<svg ...>...</svg>`}
										rows={4}
										className="font-mono text-[10px] resize-none"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
									{field.state.value && (
										<div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
											<span className="text-[10px] text-muted-foreground">
												Preview:
											</span>
											<div className="w-6 h-6 flex items-center justify-center">
												<img
													src={`data:image/svg+xml;utf8,${encodeURIComponent(field.state.value)}`}
													alt="SVG preview"
													className="w-full h-full object-contain"
												/>
											</div>
										</div>
									)}
								</div>
							</Field>
						)}
					</form.Field>
				)}

				{/* Icon Settings - Collapsible */}
				{hasIcon && iconType === "emoji" && (
					<div className="pt-2">
						<Collapsible
							open={iconSettingsOpen}
							onOpenChange={setIconSettingsOpen}
						>
							<CollapsibleTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									className="flex w-full justify-between p-0 h-auto font-medium text-xs text-muted-foreground hover:text-foreground"
								>
									<div className="flex items-center gap-2">
										<Settings className="w-3.5 h-3.5" />
										Advanced Settings
									</div>
									{iconSettingsOpen ? (
										<ChevronDown className="w-3.5 h-3.5" />
									) : (
										<ChevronRight className="w-3.5 h-3.5" />
									)}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="space-y-3 pt-4 border-l pl-4 ml-1.5">
								<form.Field name="cellAppearance.icon.opacity">
									{(field: any) => (
										<Field label="Opacity">
											<div className="flex items-center gap-3">
												<Slider
													value={[field.state.value ?? 0]}
													onValueChange={(value) => field.handleChange(value[0])}
													min={0}
													max={1}
													step={0.1}
													className="w-24"
												/>
												<span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
													{Math.round((field.state.value ?? 0) * 100)}%
												</span>
											</div>
										</Field>
									)}
								</form.Field>

								<form.Field name="cellAppearance.icon.size">
									{(field: any) => (
										<Field label="Size">
											<div className="flex items-center gap-3">
												<Slider
													value={[field.state.value ?? 1]}
													onValueChange={(value) => field.handleChange(value[0])}
													min={1}
													max={5}
													step={0.1}
													className="w-24"
												/>
												<span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
													{(field.state.value ?? 1).toFixed(1)}x
												</span>
											</div>
										</Field>
									)}
								</form.Field>

								<form.Field name="cellAppearance.icon.rotation">
									{(field: any) => (
										<Field label="Rotation">
											<div className="flex items-center gap-3">
												<Slider
													value={[field.state.value ?? 0]}
													onValueChange={(value) => field.handleChange(value[0])}
													min={-180}
													max={180}
													step={15}
													className="w-24"
												/>
												<span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
													{field.state.value ?? 0}°
												</span>
											</div>
										</Field>
									)}
								</form.Field>

								<form.Field name="cellAppearance.icon.offsetX">
									{(field: any) => (
										<Field label="X Offset">
											<div className="flex items-center gap-3">
												<Slider
													value={[field.state.value || 8]}
													onValueChange={(value) => field.handleChange(value[0])}
													min={0}
													max={50}
													step={2}
													className="w-24"
												/>
												<span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
													{field.state.value || 8}px
												</span>
											</div>
										</Field>
									)}
								</form.Field>

								<form.Field name="cellAppearance.icon.offsetY">
									{(field: any) => (
										<Field label="Y Offset">
											<div className="flex items-center gap-3">
												<Slider
													value={[field.state.value || 8]}
													onValueChange={(value) => field.handleChange(value[0])}
													min={0}
													max={50}
													step={2}
													className="w-24"
												/>
												<span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
													{field.state.value || 8}px
												</span>
											</div>
										</Field>
									)}
								</form.Field>
							</CollapsibleContent>
						</Collapsible>
					</div>
				)}
			</Section>
		</PaywallOverlay>
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
		<div className="flex items-center justify-between gap-2">
			<Label className="text-sm text-muted-foreground">{label}</Label>
			{children}
		</div>
	);
}
