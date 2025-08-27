import { useMemo } from "react";
import { useStore } from "zustand";
import type { CellElements, FontWeight } from "~/lib/models/cell-appearance";
import { Course } from "~/lib/models/course";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
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
	elementKey: CellElements;
}) {
	const prefs = useStore(TimetablePreferencesStore);

	return (
		<div className="flex items-center justify-between p-3 border rounded-lg">
			<div>
				<div className="w-24 text-sm font-medium">{name}</div>
			</div>

			<div className="flex items-center gap-3">
				<Select
					value={prefs.cellAppearance.weight[elementKey]}
					onValueChange={(v: FontWeight) =>
						prefs.setCellElementAppearanceValue("weight", elementKey, v)
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
							prefs.setCellElementAppearanceValue(
								"fontSize",
								elementKey,
								Math.max(8, prefs.cellAppearance.fontSize[elementKey] - 1),
							)
						}
					>
						-
					</Button>
					<span className="w-8 text-center text-sm tabular-nums">
						{prefs.cellAppearance.fontSize[elementKey]}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							prefs.setCellElementAppearanceValue(
								"fontSize",
								elementKey,
								Math.min(32, prefs.cellAppearance.fontSize[elementKey] + 1),
							)
						}
					>
						+
					</Button>
				</div>

				<Label className="flex items-center gap-2 cursor-pointer">
					<Switch
						checked={prefs.cellAppearance.visibility[elementKey]}
						onCheckedChange={(checked) =>
							prefs.setCellElementAppearanceValue(
								"visibility",
								elementKey,
								checked,
							)
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
	const prefs = useStore(TimetablePreferencesStore);

	const previewLayout = prefs.layout;

	const preview = useMemo(
		() => (
			<WeeklyTimetable
				layout={previewLayout}
				containerId="weekly-timetable-preview"
				courses={[
					Course.createFromSchema({
						code: "CS101",
						name: "Intro to Computer Science",
						cellAppearance: {
							background: {
								type: "solid",
								color: "#4F46E5",
							},
							fgColor: "#ffffff",
						},
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
						meetingTimes: [
							{
								day: 3,
								startTime: "08:30",
								endTime: "10:30",
								location: "Room C",
							},
						],
						cellAppearance: {
							background: {
								type: "gradient",
								gradientColors: ["#059669", "#34D399"],
								gradientDirection: "to-br",
							},
							fgColor: "#ffffff",
						},
					}),
					Course.createFromSchema({
						code: "PH102",
						cellAppearance: {
							background: {
								type: "gradient",
								gradientColors: ["#F59E42", "#F97316", "#EF4444"],
								gradientDirection: "to-t",
							},
							fgColor: "#ffffff",
						},
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
												prefs.cellAppearance.textAlign === "left"
													? "default"
													: "outline"
											}
											onClick={() =>
												prefs.setCellAppearanceValue("textAlign", "left")
											}
										>
											Left
										</Button>
										<Button
											variant={
												prefs.cellAppearance.textAlign === "center"
													? "default"
													: "outline"
											}
											onClick={() =>
												prefs.setCellAppearanceValue("textAlign", "center")
											}
										>
											Center
										</Button>
										<Button
											variant={
												prefs.cellAppearance.textAlign === "right"
													? "default"
													: "outline"
											}
											onClick={() =>
												prefs.setCellAppearanceValue("textAlign", "right")
											}
										>
											Right
										</Button>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<ElementRow name="Code" elementKey="code" />
								<ElementRow name="Course Name" elementKey="name" />
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
