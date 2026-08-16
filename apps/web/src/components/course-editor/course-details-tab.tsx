import { Clock, MapPin, Plus, Timer, Trash2 } from "lucide-react";
import { useCourseEditorForm } from "~/lib/contexts/course-editor";
import { isRecord, isString } from "~/lib/utils/predicates";
import { Button } from "../ui/button";
import { FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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

const getFieldErrorMessage = (cause: unknown) => {
	if (isString(cause)) {
		return cause;
	}

	if (isRecord(cause) && "message" in cause) {
		const message = cause.message;
		return isString(message) ? message : String(message ?? cause);
	}

	return String(cause);
};

export function CourseDetailsTab() {
	const form = useCourseEditorForm();
	return (
		<div className="space-y-6">
			{/* Basic Information Section */}
			<Section title="Basic Information">
				<form.Field name="code">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field label="Course Code">
								<div className="flex flex-col gap-1.5 flex-1 max-w-sm">
									<Input
										placeholder="CS110"
										className="font-mono h-8 text-xs"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && (
										<FieldError
											errors={field.state.meta.errors.map((e) => ({
												message: getFieldErrorMessage(e),
											}))}
										/>
									)}
								</div>
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="name">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field label="Course Name">
								<div className="flex flex-col gap-1.5 flex-1 max-w-sm">
									<Input
										placeholder="Introduction to Computer Science"
										className="h-8 text-xs"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && (
										<FieldError
											errors={field.state.meta.errors.map((e) => ({
												message: getFieldErrorMessage(e),
											}))}
										/>
									)}
								</div>
							</Field>
						);
					}}
				</form.Field>
			</Section>

			{/* Meeting Times Section */}
			<Section
				title="Schedule"
				action={
					<form.Field name="meetingTimes" mode="array">
						{(field) => (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									field.pushValue({
										day: 1,
										location: "",
										startTime: "09:00",
										endTime: "10:30",
									})
								}
								className="h-7 px-2 text-xs"
							>
								<Plus className="w-3 h-3 mr-1" />
								Add Meeting
							</Button>
						)}
					</form.Field>
				}
			>
				<form.Field name="meetingTimes" mode="array">
					{(field) => (
						<div className="space-y-4">
							{field.state.value.length === 0 && (
								<div className="rounded-xl border border-dashed p-8 text-center bg-muted/5">
									<Clock className="mx-auto mb-2 h-5 w-5 text-muted-foreground/30" />
									<p className="text-xs font-medium text-muted-foreground">
										No meetings scheduled
									</p>
								</div>
							)}

							<div className="space-y-3">
								{field.state.value.map((_, index) => (
									<div
										key={index}
										className="group relative flex flex-col gap-4 p-4 rounded-xl border bg-card shadow-sm transition-all"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-muted-foreground/40">
													#{index + 1}
												</span>
												<form.Field name={`meetingTimes[${index}].day`}>
													{(dayField) => (
														<span className="text-sm font-semibold">
															{getDayLabel(dayField.state.value)}
														</span>
													)}
												</form.Field>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => field.removeValue(index)}
												className="h-6 w-6 p-0 text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-destructive"
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
											<form.Field name={`meetingTimes[${index}].day`}>
												{(subField) => (
													<Field label="Day">
														<Select
															onValueChange={(value) =>
																subField.handleChange(Number(value))
															}
															value={subField.state.value?.toString()}
														>
															<SelectTrigger className="h-8 text-xs w-32">
																<SelectValue placeholder="Day" />
															</SelectTrigger>
															<SelectContent>
																{DAYS_OF_WEEK.map((day) => (
																	<SelectItem
																		key={day.value}
																		value={day.value.toString()}
																		className="text-xs"
																	>
																		{day.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</Field>
												)}
											</form.Field>

											<form.Field name={`meetingTimes[${index}].location`}>
												{(subField) => (
													<Field label="Location">
														<div className="relative flex-1 max-w-[160px]">
															<MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
															<Input
																placeholder="Room..."
																className="h-8 pl-7 text-xs w-full"
																value={subField.state.value}
																onBlur={subField.handleBlur}
																onChange={(e) =>
																	subField.handleChange(e.target.value)
																}
															/>
														</div>
													</Field>
												)}
											</form.Field>

											<form.Field name={`meetingTimes[${index}].startTime`}>
												{(subField) => (
													<Field label="Starts">
														<div className="relative flex-1 max-w-[160px]">
															<Timer className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
															<Input
																type="time"
																className="h-8 pl-7 text-xs w-full"
																value={subField.state.value}
																onBlur={subField.handleBlur}
																onChange={(e) =>
																	subField.handleChange(e.target.value)
																}
															/>
														</div>
													</Field>
												)}
											</form.Field>

											<form.Field name={`meetingTimes[${index}].endTime`}>
												{(subField) => (
													<Field label="Ends">
														<div className="relative flex-1 max-w-[160px]">
															<Timer className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
															<Input
																type="time"
																className="h-8 pl-7 text-xs w-full"
																value={subField.state.value}
																onBlur={subField.handleBlur}
																onChange={(e) =>
																	subField.handleChange(e.target.value)
																}
															/>
														</div>
													</Field>
												)}
											</form.Field>
										</div>
									</div>
								))}
							</div>
							<form.Subscribe selector={(state) => state.errorMap?.onChange}>
								{(error) =>
									error ? (
										<FieldError
											className="mt-2"
											errors={[{ message: String(error) }]}
										/>
									) : null
								}
							</form.Subscribe>
						</div>
					)}
				</form.Field>
			</Section>
		</div>
	);
}

function Section({
	title,
	action,
	children,
}: {
	title: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium">{title}</h4>
				{action}
			</div>
			<div className="space-y-3">{children}</div>
		</section>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<Label className="text-sm text-muted-foreground shrink-0">{label}</Label>
			{children}
		</div>
	);
}
