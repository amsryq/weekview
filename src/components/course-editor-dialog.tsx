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
import { Textarea } from "./ui/textarea";

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
				<ScrollArea className="md:h-96">
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
				color: "#3b82f6",
				meetingTimes: [
					{
						day: 1,
						location: "",
						startTime: "10:00",
						endTime: "12:00",
					},
				],
				notes: "",
				tags: "",
			},
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
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
							name="color"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Color</FormLabel>
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
										Choose a color for your course
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Additional notes about the course..."
											className="resize-none min-h-[80px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="tags"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tags</FormLabel>
									<FormControl>
										<Input
											placeholder="programming, mathematics, required"
											{...field}
										/>
									</FormControl>
									<FormDescription>Separate tags with commas</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
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

						// Close the dialog if there's no error
						if (Object.keys(form.formState.errors).length === 0) {
							setOpen(false);
						}
					}}
					defaultValues={defaultValues}
				/>
			</DialogContent>
		</Dialog>
	);
}
