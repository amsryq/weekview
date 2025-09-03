import { useFormContext } from "react-hook-form";
import type { Course } from "~/lib/models/course";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Tabs, TabsContent } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Twemoji } from "../ui/twemoji";

export function IconsTab() {
	const form = useFormContext<Course.Schema>();

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold">Icons</h3>
				<p className="text-sm text-muted-foreground">
					Add an icon to your course for better visualization
				</p>
			</div>

			<FormField
				control={form.control}
				name="cellAppearance.icon.type"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Icon Type</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder="Select icon type" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="emoji">Emoji</SelectItem>
								<SelectItem value="svg">Custom SVG</SelectItem>
							</SelectContent>
						</Select>
						<FormDescription>
							Choose between emoji or custom SVG
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<Tabs
				value={form.watch("cellAppearance.icon.type") || "emoji"}
				onValueChange={(value) =>
					form.setValue("cellAppearance.icon.type", value as "emoji" | "svg")
				}
				className="w-full"
			>
				{/* <TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="emoji">Emoji</TabsTrigger>
					<TabsTrigger value="svg">SVG Icon</TabsTrigger>
				</TabsList> */}

				<TabsContent value="emoji" className="space-y-6">
					<FormField
						control={form.control}
						name="cellAppearance.icon.emoji"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Emoji</FormLabel>
								<FormControl>
									<div className="flex items-center gap-3">
										<Input
											placeholder="📚"
											className="w-20 text-center text-lg"
											{...field}
										/>
										{field.value && (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<span>Preview:</span>
												<Twemoji
													emoji={field.value}
													style={{ fontSize: "1.5em" }}
												/>
											</div>
										)}
									</div>
								</FormControl>
								<FormDescription>
									Choose an emoji to display as a background icon
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</TabsContent>

				<TabsContent value="svg" className="space-y-6">
					<FormField
						control={form.control}
						name="cellAppearance.icon.svg"
						render={({ field }) => (
							<FormItem>
								<FormLabel>SVG Code</FormLabel>
								<FormControl>
									<div className="space-y-3">
										<Textarea
											placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>`}
											rows={4}
											className="font-mono text-xs"
											{...field}
										/>
										{field.value && (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<span>Preview:</span>
												<div style={{ fontSize: "1.5em" }}>
													<img
														src={`data:image/svg+xml;utf8,${encodeURIComponent(field.value)}`}
														alt="SVG preview"
													/>
												</div>
											</div>
										)}
									</div>
								</FormControl>
								<FormDescription>
									Enter custom SVG code. Use `fill="currentColor"` to inherit
									colors.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</TabsContent>
			</Tabs>

			{/* Icon Configuration Options */}
			<div className="space-y-4 border rounded-lg p-4">
				<h4 className="text-sm font-medium">Icon Settings</h4>

				<FormField
					control={form.control}
					name="cellAppearance.icon.opacity"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Opacity: {(field.value * 100).toFixed(0)}%</FormLabel>
							<FormControl>
								<Slider
									value={[field.value]}
									onValueChange={(value) => field.onChange(value[0])}
									min={0}
									max={1}
									step={0.1}
									className="w-full"
								/>
							</FormControl>
							<FormDescription>Adjust the icon transparency</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="cellAppearance.icon.size"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Size: {field.value.toFixed(1)}x</FormLabel>
							<FormControl>
								<Slider
									value={[field.value]}
									onValueChange={(value) => field.onChange(value[0])}
									min={1}
									max={5}
									step={0.1}
									className="w-full"
								/>
							</FormControl>
							<FormDescription>Adjust the icon size</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="cellAppearance.icon.rotation"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Rotation: {field.value}°</FormLabel>
							<FormControl>
								<Slider
									value={[field.value]}
									onValueChange={(value) => field.onChange(value[0])}
									min={-180}
									max={180}
									step={15}
									className="w-full"
								/>
							</FormControl>
							<FormDescription>Rotate the icon</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="cellAppearance.icon.offsetX"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Distance from Corner: {field.value || 8}px
								</FormLabel>
								<FormControl>
									<Slider
										value={[field.value || 8]}
										onValueChange={(value) => field.onChange(value[0])}
										min={0}
										max={50}
										step={2}
										className="w-full"
									/>
								</FormControl>
								<FormDescription>Horizontal distance</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="cellAppearance.icon.offsetY"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Vertical Distance: {field.value || 8}px</FormLabel>
								<FormControl>
									<Slider
										value={[field.value || 8]}
										onValueChange={(value) => field.onChange(value[0])}
										min={0}
										max={50}
										step={2}
										className="w-full"
									/>
								</FormControl>
								<FormDescription>Vertical distance from top</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</div>
		</div>
	);
}
