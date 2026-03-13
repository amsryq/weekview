import { useStore as useFormStore } from "@tanstack/react-form";
import { useCourseEditorForm } from "~/lib/contexts/course-editor";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
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
	const form = useCourseEditorForm();
	const iconType = useFormStore(
		form.store,
		(s) => s.values.cellAppearance?.icon?.type,
	);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold">Icons</h3>
				<p className="text-sm text-muted-foreground">
					Add an icon to your course for better visualization
				</p>
			</div>

			<form.Field name="cellAppearance.icon.type">
				{(field) => (
					<Field>
						<FieldLabel>Icon Type</FieldLabel>
						<Select
							onValueChange={(v) => field.handleChange(v as "emoji" | "svg")}
							value={field.state.value}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select icon type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="emoji">Emoji</SelectItem>
								<SelectItem value="svg">Custom SVG</SelectItem>
							</SelectContent>
						</Select>
						<FieldDescription>
							Choose between emoji or custom SVG
						</FieldDescription>
						<FieldError
							errors={field.state.meta.errors.map((e) => ({
								message: String(e?.message ?? e),
							}))}
						/>
					</Field>
				)}
			</form.Field>

			<Tabs
				value={iconType || "emoji"}
				onValueChange={(value) =>
					form.setFieldValue(
						"cellAppearance.icon.type",
						value as "emoji" | "svg",
					)
				}
				className="w-full"
			>
				{/* <TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="emoji">Emoji</TabsTrigger>
					<TabsTrigger value="svg">SVG Icon</TabsTrigger>
				</TabsList> */}

				<TabsContent value="emoji" className="space-y-6">
					<form.Field name="cellAppearance.icon.emoji">
						{(field) => (
							<Field>
								<FieldLabel>Emoji</FieldLabel>
								<div className="flex items-center gap-3">
									<Input
										placeholder="📚"
										className="w-20 text-center text-lg"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
									{field.state.value && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<span>Preview:</span>
											<Twemoji
												emoji={field.state.value}
												style={{ fontSize: "1.5em" }}
											/>
										</div>
									)}
								</div>
								<FieldDescription>
									Choose an emoji to display as a background icon
								</FieldDescription>
								<FieldError
									errors={field.state.meta.errors.map((e) => ({
										message: String(e?.message ?? e),
									}))}
								/>
							</Field>
						)}
					</form.Field>
				</TabsContent>

				<TabsContent value="svg" className="space-y-6">
					<form.Field name="cellAppearance.icon.svg">
						{(field) => (
							<Field>
								<FieldLabel>SVG Code</FieldLabel>
								<div className="space-y-3">
									<Textarea
										placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>`}
										rows={4}
										className="font-mono text-xs"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
									{field.state.value && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<span>Preview:</span>
											<div style={{ fontSize: "1.5em" }}>
												<img
													src={`data:image/svg+xml;utf8,${encodeURIComponent(field.state.value)}`}
													alt="SVG preview"
												/>
											</div>
										</div>
									)}
								</div>
								<FieldDescription>
									Enter custom SVG code. Use `fill="currentColor"` to inherit
									colors.
								</FieldDescription>
								<FieldError
									errors={field.state.meta.errors.map((e) => ({
										message: String(e?.message ?? e),
									}))}
								/>
							</Field>
						)}
					</form.Field>
				</TabsContent>
			</Tabs>

			{/* Icon Configuration Options */}
			<div className="space-y-4 border rounded-lg p-4">
				<h4 className="text-sm font-medium">Icon Settings</h4>

				<form.Field name="cellAppearance.icon.opacity">
					{(field) => (
						<Field>
							<FieldLabel>
								Opacity: {((field.state.value ?? 0) * 100).toFixed(0)}%
							</FieldLabel>
							<Slider
								value={[field.state.value ?? 0]}
								onValueChange={(value) => field.handleChange(value[0])}
								min={0}
								max={1}
								step={0.1}
								className="w-full"
							/>
							<FieldDescription>Adjust the icon transparency</FieldDescription>
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
							<FieldLabel>
								Size: {(field.state.value ?? 1).toFixed(1)}x
							</FieldLabel>
							<Slider
								value={[field.state.value ?? 1]}
								onValueChange={(value) => field.handleChange(value[0])}
								min={1}
								max={5}
								step={0.1}
								className="w-full"
							/>
							<FieldDescription>Adjust the icon size</FieldDescription>
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
							<FieldLabel>Rotation: {field.state.value ?? 0}°</FieldLabel>
							<Slider
								value={[field.state.value ?? 0]}
								onValueChange={(value) => field.handleChange(value[0])}
								min={-180}
								max={180}
								step={15}
								className="w-full"
							/>
							<FieldDescription>Rotate the icon</FieldDescription>
							<FieldError
								errors={field.state.meta.errors.map((e) => ({
									message: String(e?.message ?? e),
								}))}
							/>
						</Field>
					)}
				</form.Field>

				<div className="grid grid-cols-2 gap-4">
					<form.Field name="cellAppearance.icon.offsetX">
						{(field) => (
							<Field>
								<FieldLabel>
									Distance from Corner: {field.state.value || 8}px
								</FieldLabel>
								<Slider
									value={[field.state.value || 8]}
									onValueChange={(value) => field.handleChange(value[0])}
									min={0}
									max={50}
									step={2}
									className="w-full"
								/>
								<FieldDescription>Horizontal distance</FieldDescription>
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
								<FieldLabel>
									Vertical Distance: {field.state.value || 8}px
								</FieldLabel>
								<Slider
									value={[field.state.value || 8]}
									onValueChange={(value) => field.handleChange(value[0])}
									min={0}
									max={50}
									step={2}
									className="w-full"
								/>
								<FieldDescription>Vertical distance from top</FieldDescription>
								<FieldError
									errors={field.state.meta.errors.map((e) => ({
										message: String(e?.message ?? e),
									}))}
								/>
							</Field>
						)}
					</form.Field>
				</div>
			</div>
		</div>
	);
}
