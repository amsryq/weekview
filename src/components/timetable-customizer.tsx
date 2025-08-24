import { useMemo } from "react";
import { useStore } from "zustand";
import { Course } from "~/lib/models/course";
import type {
	CustomizableElements,
	FontWeight,
	TextAlign,
} from "~/lib/stores/timetable-preferences";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import WeeklyTimetable from "./weekly-timetable";

function ElementRow({
	name,
	elementKey,
}: {
	name: string;
	elementKey: CustomizableElements;
}) {
	const prefs = useStore(TimetablePreferencesStore, (s) => s);

	return (
		<div className="flex items-center justify-between p-3 border rounded-lg">
			<div>
				<div className="w-24 text-sm font-medium">{name}</div>
			</div>

			<div className="flex items-center gap-3">
				<Select
					value={prefs.weight[elementKey]}
					onValueChange={(v: FontWeight) =>
						prefs.setPreference("weight", elementKey, v)
					}
				>
					<SelectTrigger className="w-24">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="light">Light</SelectItem>
						<SelectItem value="normal">Normal</SelectItem>
						<SelectItem value="bold">Bold</SelectItem>
					</SelectContent>
				</Select>

				<div className="flex items-center gap-2 flex-1">
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							prefs.setPreference(
								"fontSize",
								elementKey,
								Math.max(8, prefs.fontSize[elementKey] - 1),
							)
						}
					>
						-
					</Button>
					<span className="w-8 text-center text-sm tabular-nums">
						{prefs.fontSize[elementKey]}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							prefs.setPreference(
								"fontSize",
								elementKey,
								Math.min(32, prefs.fontSize[elementKey] + 1),
							)
						}
					>
						+
					</Button>
				</div>

				<Label className="flex items-center gap-2 cursor-pointer">
					<Switch
						checked={prefs.visibility[elementKey]}
						onCheckedChange={(checked) =>
							prefs.setPreference("visibility", elementKey, checked)
						}
					/>
				</Label>
			</div>
		</div>
	);
}

export default function TimetableCustomizer({
	children,
}: {
	children: React.ReactNode;
}) {
	const prefs = useStore(TimetablePreferencesStore, (s) => s);

	// Simple subset preview: reuse actual component with preferences applied
	const previewLayout = prefs.layout;

	const preview = useMemo(
		() => (
			<WeeklyTimetable
				layout={previewLayout}
				containerId="weekly-timetable-preview"
				courses={[
					Course.createFromSchema({
						code: "CS101",
						color: "#4F46E5",
						name: "Intro to Computer Science",
						meetingTimes: [
							{
								day: 1,
								startTime: "09:00",
								endTime: "10:30",
								location: "Room A",
							},
							{
								day: 2,
								startTime: "10:00",
								endTime: "12:00",
								location: "Room B",
							},
						],
					}),
					Course.createFromSchema({
						code: "MA201",
						color: "#059669",
						meetingTimes: [
							{
								day: 3,
								startTime: "08:30",
								endTime: "10:30",
								location: "Room C",
							},
						],
					}),
					Course.createFromSchema({
						code: "PH102",
						color: "#F59E42",
						name: "Physics",
						meetingTimes: [
							{
								day: 4,
								startTime: "08:00",
								endTime: "10:00",
								location: "Lab 1",
							},
						],
					}),
				]}
			/>
		),
		[previewLayout],
	);

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Customize Timetable</DialogTitle>
				</DialogHeader>
				<ScrollArea className="flex-1 overflow-y-auto h-auto">
					<div className="grid md:grid-cols-2 gap-6 p-1">
						<div className="flex justify-center no-scroll">{preview}</div>
						<div className="space-y-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label>Table Layout</Label>
									<div className="flex gap-2">
										<Button
											variant={prefs.layout === "rows" ? "default" : "outline"}
											onClick={() => prefs.setValue("layout", "rows")}
										>
											Horizontal rows
										</Button>
										<Button
											variant={
												prefs.layout === "columns" ? "default" : "outline"
											}
											onClick={() => prefs.setValue("layout", "columns")}
										>
											Vertical columns
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Text alignment</Label>
									<div className="flex gap-2">
										<Button
											variant={
												prefs.textAlign === "left" ? "default" : "outline"
											}
											onClick={() => prefs.setValue("textAlign", "left")}
										>
											Left
										</Button>
										<Button
											variant={
												prefs.textAlign === "center" ? "default" : "outline"
											}
											onClick={() => prefs.setValue("textAlign", "center")}
										>
											Center
										</Button>
										<Button
											variant={
												prefs.textAlign === "right" ? "default" : "outline"
											}
											onClick={() => prefs.setValue("textAlign", "right")}
										>
											Right
										</Button>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<ElementRow name="Code" elementKey="code" />
								<ElementRow name="Course Name" elementKey="courseName" />
								<ElementRow name="Time" elementKey="time" />
								<ElementRow name="Location" elementKey="location" />
							</div>

							<div className="pt-2 flex gap-2">
								<DialogClose asChild>
									<Button>Close</Button>
								</DialogClose>
								<Button
									variant="outline"
									onClick={() => TimetablePreferencesStore.getState().reset()}
								>
									Reset
								</Button>
							</div>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
