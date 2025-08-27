import { zodResolver } from "@hookform/resolvers/zod";
import { toMerged } from "es-toolkit";
import { type JSX, useState } from "react";
import {
	type UseFormReturn,
	useFieldArray,
	useForm,
	useFormContext,
} from "react-hook-form";
import type { PartialDeep } from "type-fest";
import { Course } from "~/lib/models/course";
import { MeetingTime } from "~/lib/models/meeting-time";
import { CellBackgroundConfigurer } from "./cell-background-configurer";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Textarea } from "./ui/textarea";
import { Twemoji } from "./ui/twemoji";

const DAYS_OF_WEEK = [
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
	{ value: 7, label: "Sunday" },
];

function MeetingTimesSection() {
	const form = useFormContext<Course.Schema>();
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "meetingTimes",
	});

	const addMeetingTime = () =>
		append({
			day: 1,
			location: "",
			startTime: "09:00",
			endTime: "10:30",
		});

	return (
		<div className="h-full w-full overflow-hidden min-h-0">
			<div className="pb-4">
				<div>
					<h3 className="text-lg font-semibold">Meeting Times</h3>
					<p className="text-sm text-muted-foreground">
						Add weekly meeting times for this course
					</p>
				</div>
			</div>

			<div className="space-y-4">
				<ScrollArea className="md:min-h-96">
					{fields.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							<p className="text-sm">No meeting times added yet</p>
							<p className="text-xs mt-1">Click the button below to add one</p>
						</div>
					)}

					{fields.map((field, index) => (
						<div
							key={field.id}
							className="space-y-4 p-4 mb-2 bg-muted/30 rounded-lg border border-muted"
						>
							<div className="flex justify-between items-center">
								<h4 className="font-medium text-sm">Meeting #{index + 1}</h4>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => remove(index)}
									className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
								>
									×
								</Button>
							</div>

							<FormField
								control={form.control}
								name={`meetingTimes.${index}`}
								render={() => (
									<div className="grid gap-4">
										<div className="grid grid-cols-2 gap-3">
											<FormField
												control={form.control}
												name={`meetingTimes.${index}.day`}
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Day
														</FormLabel>
														<Select
															onValueChange={(value) =>
																field.onChange(Number(value))
															}
															defaultValue={field.value?.toString()}
														>
															<FormControl>
																<SelectTrigger className="h-9">
																	<SelectValue placeholder="Select day" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{DAYS_OF_WEEK.map((day) => (
																	<SelectItem
																		key={day.value}
																		value={day.value.toString()}
																	>
																		{day.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name={`meetingTimes.${index}.location`}
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Location
														</FormLabel>
														<FormControl>
															<Input
																placeholder="Room 101"
																className="h-9"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="grid grid-cols-2 gap-3">
											<FormField
												control={form.control}
												name={`meetingTimes.${index}.startTime`}
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Start Time
														</FormLabel>
														<FormControl>
															<Input type="time" className="h-9" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name={`meetingTimes.${index}.endTime`}
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															End Time
														</FormLabel>
														<FormControl>
															<Input type="time" className="h-9" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="grid gap-3">
											<FormMessage />
										</div>
									</div>
								)}
							/>
						</div>
					))}

					<Button
						type="button"
						variant="outline"
						onClick={addMeetingTime}
						className="w-full h-10 border-dashed"
					>
						<span className="text-sm">+ Add Meeting Time</span>
					</Button>
				</ScrollArea>
				<FormMessage />
			</div>
		</div>
	);
}

function CourseEditorForm(props: {
	onSubmit: (data: Course.Schema, form: UseFormReturn<Course.Schema>) => void;
	defaultValues?: PartialDeep<Course.Schema>;
}) {
	const form = useForm<Course.Schema>({
		resolver: zodResolver(Course.schema),
		defaultValues: toMerged(
			{
				code: "",
				name: "",
				meetingTimes: [
					{
						day: 1,
						location: "",
						startTime: "10:00",
						endTime: "12:00",
					},
				],
				cellAppearance: {
					background: {
						type: "solid",
						color: "#3b82f6",
					},
					fgColor: "#ffffff",
					icon: {
						type: "emoji",
						emoji: "",
						svg: "",
						opacity: 0.7,
						rotation: 15,
						offsetX: 12,
						offsetY: 12,
						size: 3,
					},
				},
			} satisfies Course.Schema,
			props.defaultValues ?? {},
		),
	});

	const onSubmit = (data: Course.Schema) => {
		const meetingObjs = data.meetingTimes.map((mt) =>
			MeetingTime.createFromSchema(mt),
		);

		// Check clashes between its own meetings
		for (let i = 0; i < meetingObjs.length; i++) {
			for (let j = i + 1; j < meetingObjs.length; j++) {
				if (meetingObjs[i].overlaps(meetingObjs[j])) {
					form.setError(`meetingTimes.${i}`, {
						message: `This meeting time conflicts with meeting #${j + 1}.`,
					});
					return;
				}
			}
		}

		props.onSubmit(data, form);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Course Form */}
					<div className="flex-[1] space-y-6">
						<div className="grid grid-cols-1 gap-4">
							<FormField
								control={form.control}
								name="code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Course Code</FormLabel>
										<FormControl>
											<Input placeholder="CS110" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Course Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Introduction to Computer Science"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="cellAppearance.background"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Background</FormLabel>
									<FormControl>
										<CellBackgroundConfigurer
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormDescription>
										Choose a background for your course
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
									<FormLabel>Text Color</FormLabel>
									<FormControl>
										<div className="flex items-center gap-3">
											<Input
												type="color"
												className="w-20 h-10 p-1"
												{...field}
											/>
											<Input
												placeholder="#3b82f6"
												className="flex-1"
												{...field}
											/>
										</div>
									</FormControl>
									<FormDescription>
										Choose a text color for your course
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Icon Configuration */}
						<div className="space-y-4 border rounded-lg p-4">
							<h3 className="text-sm font-medium">Icon Configuration</h3>

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

							{form.watch("cellAppearance.icon.type") === "emoji" && (
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
							)}

							{form.watch("cellAppearance.icon.type") === "svg" && (
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
																/>
															</div>
														</div>
													)}
												</div>
											</FormControl>
											<FormDescription>
												Enter custom SVG code. Use `fill="currentColor"` to
												inherit colors.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<FormField
								control={form.control}
								name="cellAppearance.icon.opacity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Opacity: {(field.value * 100).toFixed(0)}%
										</FormLabel>
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
										<FormDescription>
											Adjust the icon transparency
										</FormDescription>
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
											<FormLabel>
												Vertical Distance: {field.value || 8}px
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
											<FormDescription>
												Vertical distance from top
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>

					{/* Meeting Times */}
					<div className="flex-1 w-full max-md:border-t max-md:pt-4 md:border-l md:pl-6">
						<FormField
							control={form.control}
							name="meetingTimes"
							render={() => <MeetingTimesSection />}
						/>
					</div>
				</div>
				{/* Form Buttons */}
				<div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 border-t md:border-t-0">
					<div className="flex gap-3">
						<Button
							type="button"
							variant="ghost"
							onClick={() => form.reset()}
							className="flex-1 md:flex-none"
						>
							Reset
						</Button>
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								className="flex-1 md:flex-none"
							>
								Cancel
							</Button>
						</DialogClose>
					</div>
					<Button type="submit" className="flex-1 md:flex-none">
						Save
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default function CourseEditorDialog({
	children,
	title = "Edit Course",
	defaultValues = undefined,
	onSubmit,
}: {
	children: JSX.Element;
	title?: string;
	defaultValues?: PartialDeep<Course.Schema>;
	onSubmit: (data: Course.Schema, form: UseFormReturn<Course.Schema>) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="w-full max-w-full md:max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						Fill in the course details and add meeting times for your course.
					</DialogDescription>
				</DialogHeader>

				<CourseEditorForm
					onSubmit={(data, form) => {
						onSubmit(data, form);

						// This is used instead of form.formState.errors because form.formState.errors could be outdated
						const fields = form.getValues();
						const hasError = Object.keys(fields).some(
							(key) => form.getFieldState(key as keyof typeof fields).error,
						);

						if (!hasError) setOpen(false);
					}}
					defaultValues={defaultValues}
				/>
			</DialogContent>
		</Dialog>
	);
}
