import { BookOpen, Clock, MapPin, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { Course } from "~/lib/models/course";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import {
	FormControl,
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
			{/* Header */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<BookOpen className="w-5 h-5" />
					Course Details
				</h3>
				<p className="text-sm text-muted-foreground">
					Basic information and schedule for your course
				</p>
			</div>

			{/* Basic Information Section */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Basic Information</CardTitle>
					<CardDescription>
						Enter the course code and name that will appear in your timetable
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">
									Course Code
								</FormLabel>
								<FormControl>
									<Input placeholder="CS110" className="font-mono" {...field} />
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
								<FormLabel className="text-sm font-medium">
									Course Name
								</FormLabel>
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
				</CardContent>
			</Card>

			{/* Meeting Times Section */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Meeting Times</CardTitle>
					<CardDescription>
						Add weekly meeting times for this course
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FormField
						control={form.control}
						name="meetingTimes"
						render={() => (
							<div className="space-y-4">
								<FormMessage />

								{fields.length === 0 && (
									<div className="text-center py-12 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
										<Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
										<p className="text-sm font-medium">
											No meeting times added yet
										</p>
										<p className="text-xs mt-1">
											Click the button below to add your first meeting time
										</p>
									</div>
								)}

								<div className="space-y-3">
									{fields.map((field, index) => (
										<Card key={field.id} className="border-muted bg-muted/20">
											<CardHeader>
												<div className="flex justify-between items-center">
													<CardTitle className="text-sm font-medium flex items-center gap-2">
														<Clock className="w-4 h-4" />
														Meeting #{index + 1}
													</CardTitle>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => remove(index)}
														className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</CardHeader>
											<CardContent className="pt-0">
												<FormField
													control={form.control}
													name={`meetingTimes.${index}`}
													render={() => (
														<div className="space-y-4">
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																<FormField
																	control={form.control}
																	name={`meetingTimes.${index}.day`}
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel className="text-sm font-medium">
																				Day
																			</FormLabel>
																			<Select
																				onValueChange={(value) =>
																					field.onChange(Number(value))
																				}
																				defaultValue={field.value?.toString()}
																			>
																				<FormControl>
																					<SelectTrigger>
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
																			<FormLabel className="text-sm font-medium flex items-center gap-1">
																				Location
																			</FormLabel>
																			<FormControl>
																				<Input
																					placeholder="Room 101, Building A"
																					{...field}
																				/>
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>
															</div>

															<div className="grid grid-cols-2 gap-4">
																<FormField
																	control={form.control}
																	name={`meetingTimes.${index}.startTime`}
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel className="text-sm font-medium">
																				Start Time
																			</FormLabel>
																			<FormControl>
																				<Input type="time" {...field} />
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
																			<FormLabel className="text-sm font-medium">
																				End Time
																			</FormLabel>
																			<FormControl>
																				<Input type="time" {...field} />
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>
															</div>
														</div>
													)}
												/>
											</CardContent>
										</Card>
									))}
								</div>

								<Button
									type="button"
									variant="outline"
									onClick={addMeetingTime}
									className="w-full border-dashed hover:border-solid"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Meeting Time
								</Button>
							</div>
						)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
