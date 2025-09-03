import { useFieldArray, useFormContext } from "react-hook-form";
import type { Course } from "~/lib/models/course";
import { Button } from "../ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const DAYS_OF_WEEK = [
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
	{ value: 7, label: "Sunday" },
];

export function CourseDetailsTab() {
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
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold">Course Details</h3>
				<p className="text-sm text-muted-foreground">
					Basic information about your course
				</p>
			</div>

			<div className="grid gap-4">
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

			<div className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold">Meeting Times</h3>
					<p className="text-sm text-muted-foreground">
						Add weekly meeting times for this course
					</p>
				</div>

				<FormField
					control={form.control}
					name="meetingTimes"
					render={() => (
						<div className="space-y-4">
							<FormMessage />

							<ScrollArea className="max-h-96">
								{fields.length === 0 && (
									<div className="text-center py-8 text-muted-foreground">
										<p className="text-sm">No meeting times added yet</p>
										<p className="text-xs mt-1">
											Click the button below to add one
										</p>
									</div>
								)}

								{fields.map((field, index) => (
									<div
										key={field.id}
										className="space-y-4 p-4 mb-2 bg-muted/30 rounded-lg border border-muted"
									>
										<div className="flex justify-between items-center">
											<h4 className="font-medium text-sm">
												Meeting #{index + 1}
											</h4>
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
																		<Input
																			type="time"
																			className="h-9"
																			{...field}
																		/>
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
																		<Input
																			type="time"
																			className="h-9"
																			{...field}
																		/>
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
						</div>
					)}
				/>
			</div>
		</div>
	);
}
