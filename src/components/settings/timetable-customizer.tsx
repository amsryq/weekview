import { merge } from "es-toolkit";
import { Image, Palette, Table } from "lucide-react";
import { PartialDeep } from "type-fest";
import { useStore } from "zustand";
import type { CellAppearance } from "~/lib/models/cell-appearance";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { PaywallOverlay } from "../paywall-overlay";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { BackgroundImageUpload } from "./background-image-upload";
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
					<DialogDescription>
						Customize the overall appearance and layout of your timetable
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="flex-1 overflow-y-auto h-full">
					<div className="pr-4 space-y-6">
						{/* Table Layout Section */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Table Layout</CardTitle>
								<CardDescription>
									Choose how your timetable is organized
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<Label className="text-sm font-medium">Layout Style</Label>
									<div className="flex gap-2">
										<Button
											variant={prefs.layout === "rows" ? "default" : "outline"}
											onClick={() => prefs.setValue("layout", "rows")}
											className="flex items-center gap-2"
										>
											<Table className="w-4 h-4" />
											Horizontal rows
										</Button>
										<Button
											variant={
												prefs.layout === "columns" ? "default" : "outline"
											}
											onClick={() => prefs.setValue("layout", "columns")}
											className="flex items-center gap-2"
										>
											<Table className="w-4 h-4 rotate-90" />
											Vertical columns
										</Button>
									</div>
									<p className="text-xs text-muted-foreground">
										Choose between horizontal rows (days as rows) or vertical
										columns (days as columns)
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Background Image Section */}
						<PaywallOverlay
							title="Premium Feature"
							description="Background images are available for supporters only. Unlock this feature and support the project!"
							className="overflow-clip rounded-xl border-1"
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-base">
										<Image className="w-5 h-5" />
										Background
									</CardTitle>
									<CardDescription>
										Set a custom background for your timetable
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<Label className="text-sm font-medium flex items-center gap-2">
											Image
										</Label>
										<BackgroundImageUpload
											value={prefs.backgroundImage}
											onChange={(imageUrl) =>
												prefs.setBackgroundImage(imageUrl)
											}
											options={prefs.backgroundImageOptions}
											onOptionsChange={(options) =>
												prefs.setBackgroundImageOptions(options)
											}
										/>
										<p className="text-xs text-muted-foreground">
											Upload an image to use as the background for your
											timetable
										</p>
									</div>
								</CardContent>
							</Card>
						</PaywallOverlay>

						{/* Cell Appearance Settings */}
						<Card>
							{/* Cell Styles Header */}
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Palette className="w-5 h-5" />
									Cell Styles
								</CardTitle>
								<CardDescription>
									Customize the default appearance of course cells
								</CardDescription>
							</CardHeader>

							<CardContent>
								<CellAppearanceLayoutSettings
									value={prefs.cellAppearance}
									onChange={handleCellAppearanceChange}
								/>
							</CardContent>
						</Card>
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
