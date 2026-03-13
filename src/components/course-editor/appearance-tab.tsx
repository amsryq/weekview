import {
	ChevronDown,
	ChevronRight,
	Palette,
	Settings,
	SmileIcon,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useStore } from "zustand";
import type { Course } from "~/lib/models/course";
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
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
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
	const form = useFormContext<Course.Schema>();
	const [iconSettingsOpen, setIconSettingsOpen] = useState(false);

	// Watch all icon-related fields at the top level to avoid conditional hook usage
	const iconType = form.watch("cellAppearance.icon.type");
	const iconEmoji = form.watch("cellAppearance.icon.emoji");
	const iconSvg = form.watch("cellAppearance.icon.svg");
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
					<FormField
						control={form.control}
						name="cellAppearance.background"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">
									Background
								</FormLabel>
								<FormControl>
									<ColorSelectorGrid
										value={field.value}
										onChange={(value) => {
											field.onChange(value);
											form.setValue("themeColorIndex", null, {
												shouldDirty: true,
											});
										}}
									/>
								</FormControl>
								<FormDescription>
									Choose a solid color or gradient for your course background
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="cellAppearance.fgColor"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">
									Text Color
								</FormLabel>
								<FormControl>
									<div className="flex items-center gap-3">
										<div className="relative">
											<Input
												type="color"
												className="w-14 h-10 p-1 rounded-md border cursor-pointer"
												{...field}
											/>
										</div>
										<Input
											placeholder="#ffffff"
											className="flex-1 font-mono text-sm"
											{...field}
										/>
									</div>
								</FormControl>
								<FormDescription>
									Select the text color that contrasts well with your background
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
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
					<FormField
						control={form.control}
						name="cellAppearance.fontFamily"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">Font</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value ?? style.fontFamily}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select font" />
										</SelectTrigger>
									</FormControl>
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
								<FormDescription>
									Style font: {style.fontFamily}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
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
						<FormField
							control={form.control}
							name="cellAppearance.icon.type"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-medium">
										Icon Type
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Choose icon type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="emoji">Emoji</SelectItem>
											<SelectItem value="svg">Custom SVG</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Choose between an emoji or custom SVG icon
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Emoji Input */}
						{iconType === "emoji" && (
							<FormField
								control={form.control}
								name="cellAppearance.icon.emoji"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">Emoji</FormLabel>
										<FormControl>
											<div className="flex items-center gap-2">
												<Popover modal={true}>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className="py-2 text-xl bg-muted/50 hover:bg-muted/70"
														>
															{field.value ? (
																<Twemoji
																	emoji={field.value}
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
															onEmojiSelect={({ emoji }) => {
																field.onChange(emoji);
															}}
														>
															<EmojiPickerSearch />
															<EmojiPickerContent />
															<EmojiPickerFooter />
														</EmojiPicker>
													</PopoverContent>
												</Popover>
												{field.value && (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => field.onChange("")}
														className="h-6 w-6 p-0 hover:text-destructive text-foreground"
													>
														×
													</Button>
												)}
											</div>
										</FormControl>
										<FormDescription>
											Click to select an emoji for your course icon
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* SVG Input */}
						{iconType === "svg" && (
							<FormField
								control={form.control}
								name="cellAppearance.icon.svg"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">
											SVG Code
										</FormLabel>
										<FormControl>
											<div className="space-y-4">
												<Textarea
													placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>`}
													rows={6}
													className="font-mono text-xs resize-none"
													{...field}
												/>
												{field.value && (
													<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
														<span className="text-sm text-muted-foreground">
															Preview:
														</span>
														<div className="w-8 h-8 flex items-center justify-center">
															<img
																src={`data:image/svg+xml;utf8,${encodeURIComponent(field.value)}`}
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
										</FormControl>
										<FormDescription>
											Paste your SVG code here. Use "currentColor" for fill to
											inherit text color.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
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
												<FormField
													control={form.control}
													name="cellAppearance.icon.opacity"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm">
																Opacity{" "}
																<span className="text-muted-foreground">
																	({((field.value ?? 0) * 100).toFixed(0)}%)
																</span>
															</FormLabel>
															<FormControl>
																<Slider
																	value={[field.value ?? 0]}
																	onValueChange={(value) =>
																		field.onChange(value[0])
																	}
																	min={0}
																	max={1}
																	step={0.1}
																	className="w-full"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="cellAppearance.icon.size"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm">
																Size{" "}
																<span className="text-muted-foreground">
																	({(field.value ?? 1).toFixed(1)}x)
																</span>
															</FormLabel>
															<FormControl>
																<Slider
																	value={[field.value ?? 1]}
																	onValueChange={(value) =>
																		field.onChange(value[0])
																	}
																	min={1}
																	max={5}
																	step={0.1}
																	className="w-full"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="cellAppearance.icon.rotation"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm">
																Rotation{" "}
																<span className="text-muted-foreground">
																	({field.value ?? 0}°)
																</span>
															</FormLabel>
															<FormControl>
																<Slider
																	value={[field.value ?? 0]}
																	onValueChange={(value) =>
																		field.onChange(value[0])
																	}
																	min={-180}
																	max={180}
																	step={15}
																	className="w-full"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="cellAppearance.icon.offsetX"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm">
																Horizontal Distance{" "}
																<span className="text-muted-foreground">
																	({field.value || 8}px)
																</span>
															</FormLabel>
															<FormControl>
																<Slider
																	value={[field.value || 8]}
																	onValueChange={(value) =>
																		field.onChange(value[0])
																	}
																	min={0}
																	max={50}
																	step={2}
																	className="w-full"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="cellAppearance.icon.offsetY"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm">
																Vertical Distance{" "}
																<span className="text-muted-foreground">
																	({field.value || 8}px)
																</span>
															</FormLabel>
															<FormControl>
																<Slider
																	value={[field.value || 8]}
																	onValueChange={(value) =>
																		field.onChange(value[0])
																	}
																	min={0}
																	max={50}
																	step={2}
																	className="w-full"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
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
