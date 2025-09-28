import { merge } from "es-toolkit";
import { PartialDeep } from "type-fest";
import { useStore } from "zustand";
import type { CellAppearance } from "~/lib/models/cell-appearance";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CellAppearanceLayoutSettings } from "./cell-appearance-layout-settings";

export default function TimetableCustomizer({
	children,
}: {
	children: React.ReactNode;
}) {
	const prefs = useStore(TimetablePreferencesStore);
	// const previewLayout = prefs.layout;

	const handleCellAppearanceChange = (changes: PartialDeep<CellAppearance>) => {
		TimetablePreferencesStore.setState((writable) => {
			merge(writable.cellAppearance, changes);
		});
	};

	// const preview = useMemo(
	//   () => (
	//     <WeeklyTimetable
	//       layout={previewLayout}
	//       containerId="weekly-timetable-preview"
	//       courses={[
	//         Course.createFromSchema({
	//           code: "CS101",
	//           name: "Intro to Computer Science",
	//           cellAppearance: {
	//             background: {
	//               type: "solid",
	//               color: "#4F46E5",
	//             },
	//             fgColor: "#ffffff",
	//           },
	//           meetingTimes: [
	//             {
	//               day: 1,
	//               startTime: "09:00",
	//               endTime: "10:30",
	//               location: "Room A",
	//             },
	//             {
	//               day: 2,
	//               startTime: "10:00",
	//               endTime: "12:00",
	//               location: "Room B",
	//             },
	//           ],
	//         }),
	//         Course.createFromSchema({
	//           code: "MA201",
	//           meetingTimes: [
	//             {
	//               day: 3,
	//               startTime: "08:30",
	//               endTime: "10:30",
	//               location: "Room C",
	//             },
	//           ],
	//           cellAppearance: {
	//             background: {
	//               type: "gradient",
	//               gradientColors: ["#059669", "#34D399"],
	//               gradientDirection: "to-br",
	//             },
	//             fgColor: "#ffffff",
	//           },
	//         }),
	//         Course.createFromSchema({
	//           code: "PH102",
	//           cellAppearance: {
	//             background: {
	//               type: "gradient",
	//               gradientColors: ["#F59E42", "#F97316", "#EF4444"],
	//               gradientDirection: "to-t",
	//             },
	//             fgColor: "#ffffff",
	//           },
	//           name: "Physics",
	//           meetingTimes: [
	//             {
	//               day: 4,
	//               startTime: "08:00",
	//               endTime: "10:00",
	//               location: "Lab 1",
	//             },
	//           ],
	//         }),
	//       ]}
	//     />
	//   ),
	//   [previewLayout],
	// );

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="flex flex-col w-2xl sm:max-w-[90vw] h-[80vh]">
				<DialogHeader>
					<DialogTitle>Customize Timetable</DialogTitle>
				</DialogHeader>
				<ScrollArea className="flex-1 overflow-y-auto h-full">
					<div className="gap-6 p-1">
						<div className="space-y-6">
							<Tabs defaultValue="timetable" className="w-full">
								<TabsList className="grid grid-cols-2 w-full">
									<TabsTrigger value="timetable">Timetable Layout</TabsTrigger>
									<TabsTrigger value="cells">Cell Layout</TabsTrigger>
								</TabsList>

								<TabsContent value="timetable" className="space-y-4 mt-6">
									<div className="space-y-2">
										<Label>Table Layout</Label>
										<div className="flex gap-2">
											<Button
												variant={
													prefs.layout === "rows" ? "default" : "outline"
												}
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
								</TabsContent>

								<TabsContent value="cells" className="space-y-3 mt-6">
									<CellAppearanceLayoutSettings
										value={prefs.cellAppearance}
										onChange={handleCellAppearanceChange}
									/>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</ScrollArea>

				{/* Sticky footer with buttons */}
				<div className="flex justify-end gap-2 pt-4 border-t bg-background">
					<Button
						variant="outline"
						onClick={() => TimetablePreferencesStore.getState().reset()}
					>
						Reset to defaults
					</Button>
					<DialogClose asChild>
						<Button>Close</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}
