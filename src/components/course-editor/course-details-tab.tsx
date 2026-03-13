import { BookOpen, CalendarDays, Clock, MapPin, Plus, Timer, Trash2 } from "lucide-react";
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

const getDayLabel = (dayValue?: number) =>
	DAYS_OF_WEEK.find((day) => day.value === dayValue)?.label ?? "Select day";

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
							<div className="space-y-5">
								<FormMessage />

								<div className="flex items-center justify-between gap-3">
									<div className="inline-flex items-center rounded-full border border-muted-foreground/20 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
										{fields.length} {fields.length === 1 ? "meeting" : "meetings"}
									</div>
									<Button
										type="button"
										variant="outline"
										onClick={addMeetingTime}
										className="h-9 px-3"
									>
										<Plus className="w-4 h-4 mr-2" />
										Add
									</Button>
								</div>

								{fields.length === 0 && (
									<div className="rounded-xl border border-dashed border-muted-foreground/30 bg-linear-to-br from-muted/35 to-transparent px-4 py-10 text-center text-muted-foreground">
										<Clock className="mx-auto mb-3 h-8 w-8 opacity-50" />
										<p className="text-sm font-medium text-foreground/80">
											No meeting times added yet
										</p>
										<p className="text-xs mt-1">
											Use the Add button above to create your first slot
										</p>
									</div>
								)}

								<div className="space-y-4">
									{fields.map((field, index) => (
										<Card
											key={field.id}
											className="border-muted/70 shadow-sm"
										>
											<CardHeader className="pb-4">
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0 space-y-1">
														<CardTitle className="flex items-center gap-2 text-sm font-semibold">
															<Clock className="h-4 w-4" />
															Meeting #{index + 1}
														</CardTitle>
														<p className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/70 px-2 py-0.5 text-xs text-muted-foreground">
															<CalendarDays className="h-3 w-3" />
															{getDayLabel(form.watch(`meetingTimes.${index}.day`))}
														</p>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => remove(index)}
														className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
														<span className="sr-only">Remove meeting {index + 1}</span>
													</Button>
												</div>
											</CardHeader>
											<CardContent className="pt-0">
												<FormField
													control={form.control}
													name={`meetingTimes.${index}`}
													render={() => (
														<div className="space-y-4">
															<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
																<FormField
																	control={form.control}
																	name={`meetingTimes.${index}.day`}
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel className="flex items-center gap-1.5 text-sm font-medium">
																				<CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
																				Day
																			</FormLabel>
																			<Select
																				onValueChange={(value) =>
																					field.onChange(Number(value))
																				}
																				value={field.value?.toString()}
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
																			<FormLabel className="flex items-center gap-1.5 text-sm font-medium">
																				<MapPin className="h-3.5 w-3.5 text-muted-foreground" />
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

																<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
																<FormField
																	control={form.control}
																	name={`meetingTimes.${index}.startTime`}
																	render={({ field }) => (
																		<FormItem>
																				<FormLabel className="flex items-center gap-1.5 text-sm font-medium">
																					<Timer className="h-3.5 w-3.5 text-muted-foreground" />
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
																			<FormLabel className="flex items-center gap-1.5 text-sm font-medium">
																				<Timer className="h-3.5 w-3.5 text-muted-foreground" />
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
							</div>
						)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
