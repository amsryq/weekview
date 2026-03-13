import { useStore as useFormStore } from "@tanstack/react-form";
import {
	ChevronDown,
	ChevronRight,
	Palette,
	Settings,
	SmileIcon,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "zustand";
import { useCourseEditorForm } from "~/lib/contexts/course-editor";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { PREDEFINED_FONTS } from "~/lib/utils/fonts";
import { resolveTimetableStyle } from "~/lib/utils/timetable-styles";
import { PaywallOverlay } from "../paywall-overlay";
import { ColorSelectorGrid } from "../settings/color-selector-grid";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
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
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
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

export function AppearanceTab() {
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

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<Palette className="w-5 h-5" />
					Appearance
				</h3>
				<p className="text-sm text-muted-foreground">
					Customize how your course looks in the timetable
				</p>
			</div>

			{/* Colors Section */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Colors</CardTitle>
					<CardDescription>
						Choose the background and text colors for your course
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<form.Field name="cellAppearance.background">
						{(field) => (
							<Field>
								<FieldLabel className="text-sm font-medium">
									Background
								</FieldLabel>
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
								<FieldDescription>
									Choose a solid color or gradient for your course background
								</FieldDescription>
								<FieldError
									errors={field.state.meta.errors.map((e) => ({
										message: String(e?.message ?? e),
									}))}
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="cellAppearance.fgColor">
						{(field) => (
							<Field>
								<FieldLabel className="text-sm font-medium">
									Text Color
								</FieldLabel>
								<div className="flex items-center gap-3">
									<div className="relative">
										<Input
											type="color"
											className="w-14 h-10 p-1 rounded-md border cursor-pointer"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
										/>
									</div>
									<Input
										placeholder="#ffffff"
										className="flex-1 font-mono text-sm"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
								</div>
								<FieldDescription>
									Select the text color that contrasts well with your background
								</FieldDescription>
								<FieldError
									errors={field.state.meta.errors.map((e) => ({
										message: String(e?.message ?? e),
									}))}
								/>
							</Field>
						)}
					</form.Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Typography</CardTitle>
					<CardDescription>
						Choose a font for this course. This can override the active style
						font.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form.Field name="cellAppearance.fontFamily">
						{(field) => (
							<Field>
								<FieldLabel className="text-sm font-medium">Font</FieldLabel>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value ?? style.fontFamily}
								>
									<SelectTrigger>
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
								<FieldDescription>
									Style font: {style.fontFamily}
								</FieldDescription>
								<FieldError
									errors={field.state.meta.errors.map((e) => ({
										message: String(e?.message ?? e),
									}))}
								/>
							</Field>
						)}
					</form.Field>
				</CardContent>
			</Card>

			{/* Icon Section */}
			<PaywallOverlay
				title="Premium Feature"
				description="Icons are available for supporters only. Unlock this feature and support the project!"
				className="overflow-clip border-1 rounded-xl"
			>
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Icon</CardTitle>
						<CardDescription>
							Add an emoji or custom icon to personalize your course
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<form.Field name="cellAppearance.icon.type">
							{(field) => (
								<Field>
									<FieldLabel className="text-sm font-medium">
										Icon Type
									</FieldLabel>
									<Select
										onValueChange={(v) =>
											field.handleChange(v as "emoji" | "svg")
										}
										value={field.state.value}
									>
										<SelectTrigger>
											<SelectValue placeholder="Choose icon type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="emoji">Emoji</SelectItem>
											<SelectItem value="svg">Custom SVG</SelectItem>
										</SelectContent>
									</Select>
									<FieldDescription>
										Choose between an emoji or custom SVG icon
									</FieldDescription>
									<FieldError
										errors={field.state.meta.errors.map((e) => ({
											message: String(e?.message ?? e),
										}))}
									/>
								</Field>
							)}
						</form.Field>

						{/* Emoji Input */}
						{iconType === "emoji" && (
							<form.Field name="cellAppearance.icon.emoji">
								{(field) => (
									<Field>
										<FieldLabel className="text-sm font-medium">
											Emoji
										</FieldLabel>
										<div className="flex items-center gap-2">
											<Popover modal={true}>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														className="py-2 text-xl bg-muted/50 hover:bg-muted/70"
													>
														{field.state.value ? (
															<Twemoji
																emoji={field.state.value}
																className="text-xl leading-0"
															/>
														) : (
															<SmileIcon />
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
										<FieldDescription>
											Click to select an emoji for your course icon
										</FieldDescription>
										<FieldError
											errors={field.state.meta.errors.map((e) => ({
												message: String(e?.message ?? e),
											}))}
										/>
									</Field>
								)}
							</form.Field>
						)}

						{/* SVG Input */}
						{iconType === "svg" && (
							<form.Field name="cellAppearance.icon.svg">
								{(field) => (
									<Field>
										<FieldLabel className="text-sm font-medium">
											SVG Code
										</FieldLabel>
										<div className="space-y-4 w-full">
											<Textarea
												placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>`}
												rows={6}
												className="font-mono text-xs resize-none"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
											/>
											{field.state.value && (
												<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
													<span className="text-sm text-muted-foreground">
														Preview:
													</span>
													<div className="w-8 h-8 flex items-center justify-center">
														<img
															src={`data:image/svg+xml;utf8,${encodeURIComponent(field.state.value)}`}
															alt="SVG preview"
															className="w-full h-full object-contain"
															onError={(e) => {
																(e.target as HTMLImageElement).style.display =
																	"none";
															}}
														/>
													</div>
												</div>
											)}
										</div>
										<FieldDescription>
											Paste your SVG code here. Use "currentColor" for fill to
											inherit text color.
										</FieldDescription>
										<FieldError
											errors={field.state.meta.errors.map((e) => ({
												message: String(e?.message ?? e),
											}))}
										/>
									</Field>
								)}
							</form.Field>
						)}

						{/* Icon Settings - Collapsible */}
						{hasIcon && iconType === "emoji" && (
							<Collapsible
								open={iconSettingsOpen}
								onOpenChange={setIconSettingsOpen}
							>
								<CollapsibleTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										className="flex w-full justify-between p-0 h-auto font-medium text-sm"
									>
										<div className="flex items-center gap-2">
											<Settings className="w-4 h-4" />
											Icon Settings
										</div>
										{iconSettingsOpen ? (
											<ChevronDown className="w-4 h-4" />
										) : (
											<ChevronRight className="w-4 h-4" />
										)}
									</Button>
								</CollapsibleTrigger>
								<CollapsibleContent className="space-y-4 pt-4">
									<Card>
										<CardContent>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<form.Field name="cellAppearance.icon.opacity">
													{(field) => (
														<Field>
															<FieldLabel className="text-sm">
																Opacity{" "}
																<span className="text-muted-foreground">
																	({((field.state.value ?? 0) * 100).toFixed(0)}
																	%)
																</span>
															</FieldLabel>
															<Slider
																value={[field.state.value ?? 0]}
																onValueChange={(value) =>
																	field.handleChange(value[0])
																}
																min={0}
																max={1}
																step={0.1}
																className="w-full"
															/>
															<FieldError
																errors={field.state.meta.errors.map((e) => ({
																	message: String(e?.message ?? e),
																}))}
															/>
														</Field>
													)}
												</form.Field>

												<form.Field name="cellAppearance.icon.size">
													{(field) => (
														<Field>
															<FieldLabel className="text-sm">
																Size{" "}
																<span className="text-muted-foreground">
																	({(field.state.value ?? 1).toFixed(1)}x)
																</span>
															</FieldLabel>
															<Slider
																value={[field.state.value ?? 1]}
																onValueChange={(value) =>
																	field.handleChange(value[0])
																}
																min={1}
																max={5}
																step={0.1}
																className="w-full"
															/>
															<FieldError
																errors={field.state.meta.errors.map((e) => ({
																	message: String(e?.message ?? e),
																}))}
															/>
														</Field>
													)}
												</form.Field>

												<form.Field name="cellAppearance.icon.rotation">
													{(field) => (
														<Field>
															<FieldLabel className="text-sm">
																Rotation{" "}
																<span className="text-muted-foreground">
																	({field.state.value ?? 0}°)
																</span>
															</FieldLabel>
															<Slider
																value={[field.state.value ?? 0]}
																onValueChange={(value) =>
																	field.handleChange(value[0])
																}
																min={-180}
																max={180}
																step={15}
																className="w-full"
															/>
															<FieldError
																errors={field.state.meta.errors.map((e) => ({
																	message: String(e?.message ?? e),
																}))}
															/>
														</Field>
													)}
												</form.Field>

												<form.Field name="cellAppearance.icon.offsetX">
													{(field) => (
														<Field>
															<FieldLabel className="text-sm">
																Horizontal Distance{" "}
																<span className="text-muted-foreground">
																	({field.state.value || 8}px)
																</span>
															</FieldLabel>
															<Slider
																value={[field.state.value || 8]}
																onValueChange={(value) =>
																	field.handleChange(value[0])
																}
																min={0}
																max={50}
																step={2}
																className="w-full"
															/>
															<FieldError
																errors={field.state.meta.errors.map((e) => ({
																	message: String(e?.message ?? e),
																}))}
															/>
														</Field>
													)}
												</form.Field>

												<form.Field name="cellAppearance.icon.offsetY">
													{(field) => (
														<Field>
															<FieldLabel className="text-sm">
																Vertical Distance{" "}
																<span className="text-muted-foreground">
																	({field.state.value || 8}px)
																</span>
															</FieldLabel>
															<Slider
																value={[field.state.value || 8]}
																onValueChange={(value) =>
																	field.handleChange(value[0])
																}
																min={0}
																max={50}
																step={2}
																className="w-full"
															/>
															<FieldError
																errors={field.state.meta.errors.map((e) => ({
																	message: String(e?.message ?? e),
																}))}
															/>
														</Field>
													)}
												</form.Field>
											</div>
										</CardContent>
									</Card>
								</CollapsibleContent>
							</Collapsible>
						)}
					</CardContent>
				</Card>
			</PaywallOverlay>
		</div>
	);
}
