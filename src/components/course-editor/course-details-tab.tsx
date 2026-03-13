import {
	BookOpen,
	CalendarDays,
	Clock,
	MapPin,
	Plus,
	Timer,
	Trash2,
} from "lucide-react";
import { useCourseEditorForm } from "~/lib/contexts/course-editor";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Field, FieldError, FieldLabel } from "../ui/field";
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
	DAYS_OF_WEEK.find((day: any) => day.value === dayValue)?.label ??
	"Select day";

export function CourseDetailsTab() {
	const form = useCourseEditorForm();
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
					<form.Field name="code">
						{(field: any) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel className="text-sm font-medium">
										Course Code
									</FieldLabel>
									<Input
										placeholder="CS110"
										className="font-mono"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e: any) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && (
										<FieldError
											errors={field.state.meta.errors.map((e: any) => ({
												message: String((e as any)?.message ?? e),
											}))}
										/>
									)}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="name">
						{(field: any) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel className="text-sm font-medium">
										Course Name
									</FieldLabel>
									<Input
										placeholder="Introduction to Computer Science"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e: any) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && (
										<FieldError
											errors={field.state.meta.errors.map((e: any) => ({
												message: String((e as any)?.message ?? e),
											}))}
										/>
									)}
								</Field>
							);
						}}
					</form.Field>
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
					<form.Field name="meetingTimes" mode="array">
						{(field: any) => (
							<div className="space-y-5">
								<div className="flex items-center justify-between gap-3">
									<div className="inline-flex items-center rounded-full border border-muted-foreground/20 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
										{field.state.value.length}{" "}
										{field.state.value.length === 1 ? "meeting" : "meetings"}
									</div>
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											field.pushValue({
												day: 1,
												location: "",
												startTime: "09:00",
												endTime: "10:30",
											})
										}
										className="h-9 px-3"
									>
										<Plus className="w-4 h-4 mr-2" />
										Add
									</Button>
								</div>

								{field.state.value.length === 0 && (
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
									{field.state.value.map((_: any, index: any) => {
										// We need to check if there are top level array errors for this specific index
										// But usually TanStack form returns errors on the subfields or the array field itself
										return (
											<Card key={index} className="border-muted/70 shadow-sm">
												<CardHeader className="pb-4">
													<div className="flex items-start justify-between gap-3">
														<div className="min-w-0 space-y-1">
															<CardTitle className="flex items-center gap-2 text-sm font-semibold">
																<Clock className="h-4 w-4" />
																Meeting #{index + 1}
															</CardTitle>
															<form.Field name={`meetingTimes[${index}].day`}>
																{(dayField: any) => (
																	<p className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/70 px-2 py-0.5 text-xs text-muted-foreground">
																		<CalendarDays className="h-3 w-3" />
																		{getDayLabel(
																			dayField.state.value as number,
																		)}
																	</p>
																)}
															</form.Field>
														</div>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => field.removeValue(index)}
															className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
														>
															<Trash2 className="h-4 w-4" />
															<span className="sr-only">
																Remove meeting {index + 1}
															</span>
														</Button>
													</div>
												</CardHeader>
												<CardContent className="pt-0">
													<div className="space-y-4">
														<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
															<form.Field name={`meetingTimes[${index}].day`}>
																{(subField: any) => {
																	const isInvalid =
																		subField.state.meta.isTouched &&
																		!subField.state.meta.isValid;
																	return (
																		<Field data-invalid={isInvalid}>
																			<FieldLabel className="flex items-center gap-1.5 text-sm font-medium">
																				<CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
																				Day
																			</FieldLabel>
																			<Select
																				onValueChange={(value) =>
																					subField.handleChange(Number(value))
																				}
																				value={subField.state.value?.toString()}
																			>
																				<SelectTrigger aria-invalid={isInvalid}>
																					<SelectValue placeholder="Select day" />
																				</SelectTrigger>
																				<SelectContent>
																					{DAYS_OF_WEEK.map((day: any) => (
																						<SelectItem
																							key={day.value}
																							value={day.value.toString()}
																						>
																							{day.label}
																						</SelectItem>
																					))}
																				</SelectContent>
																			</Select>
																			{isInvalid && (
																				<FieldError
																					errors={subField.state.meta.errors.map(
																						(e: any) => ({
																							message: String(e?.message ?? e),
																						}),
																					)}
																				/>
																			)}
																		</Field>
																	);
																}}
															</form.Field>

															<form.Field
																name={`meetingTimes[${index}].location`}
															>
																{(subField: any) => {
																	const isInvalid =
																		subField.state.meta.isTouched &&
																		!subField.state.meta.isValid;
																	return (
																		<Field data-invalid={isInvalid}>
																			<FieldLabel className="flex items-center gap-1.5 text-sm font-medium">
																				<MapPin className="h-3.5 w-3.5 text-muted-foreground" />
																				Location
																			</FieldLabel>
																			<Input
																				placeholder="Room 101, Building A"
																				value={subField.state.value}
																				onBlur={subField.handleBlur}
																				onChange={(e: any) =>
																					subField.handleChange(e.target.value)
																				}
																				aria-invalid={isInvalid}
																			/>
																			{isInvalid && (
																				<FieldError
																					errors={subField.state.meta.errors.map(
																						(e: any) => ({
																							message: String(e?.message ?? e),
																						}),
																					)}
																				/>
																			)}
																		</Field>
																	);
																}}
															</form.Field>
														</div>

														<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
															<form.Field
																name={`meetingTimes[${index}].startTime`}
															>
																{(subField: any) => {
																	const isInvalid =
																		subField.state.meta.isTouched &&
																		!subField.state.meta.isValid;
																	return (
																		<Field data-invalid={isInvalid}>
																			<FieldLabel className="flex items-center gap-1.5 text-sm font-medium">
																				<Timer className="h-3.5 w-3.5 text-muted-foreground" />
																				Start Time
																			</FieldLabel>
																			<Input
																				type="time"
																				value={subField.state.value}
																				onBlur={subField.handleBlur}
																				onChange={(e: any) =>
																					subField.handleChange(e.target.value)
																				}
																				aria-invalid={isInvalid}
																			/>
																			{isInvalid && (
																				<FieldError
																					errors={subField.state.meta.errors.map(
																						(e: any) => ({
																							message: String(e?.message ?? e),
																						}),
																					)}
																				/>
																			)}
																		</Field>
																	);
																}}
															</form.Field>

															<form.Field
																name={`meetingTimes[${index}].endTime`}
															>
																{(subField: any) => {
																	const isInvalid =
																		subField.state.meta.isTouched &&
																		!subField.state.meta.isValid;
																	return (
																		<Field data-invalid={isInvalid}>
																			<FieldLabel className="flex items-center gap-1.5 text-sm font-medium">
																				<Timer className="h-3.5 w-3.5 text-muted-foreground" />
																				End Time
																			</FieldLabel>
																			<Input
																				type="time"
																				value={subField.state.value}
																				onBlur={subField.handleBlur}
																				onChange={(e: any) =>
																					subField.handleChange(e.target.value)
																				}
																				aria-invalid={isInvalid}
																			/>
																			{isInvalid && (
																				<FieldError
																					errors={subField.state.meta.errors.map(
																						(e: any) => ({
																							message: String(e?.message ?? e),
																						}),
																					)}
																				/>
																			)}
																		</Field>
																	);
																}}
															</form.Field>
														</div>
														{field.state.meta.errors.length > 0 && (
															<FieldError
																errors={field.state.meta.errors.map(
																	(e: any) => ({
																		message: String(e?.message ?? e),
																	}),
																)}
															/>
														)}
													</div>
												</CardContent>
											</Card>
										);
									})}
								</div>
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>
		</div>
	);
}
