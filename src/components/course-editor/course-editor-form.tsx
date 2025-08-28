import { zodResolver } from "@hookform/resolvers/zod";
import { toMerged } from "es-toolkit";
import { type UseFormReturn, useForm } from "react-hook-form";
import type { PartialDeep } from "type-fest";
import { Course } from "~/lib/models/course";
import { MeetingTime } from "~/lib/models/meeting-time";
import { Button } from "../ui/button";
import { DialogClose } from "../ui/dialog";
import { Form, FormMessage } from "../ui/form";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AppearanceTab } from "./appearance-tab";
import { CourseDetailsTab } from "./course-details-tab";
import { CoursePreview } from "./course-preview";
import { IconsTab } from "./icons-tab";
import { LayoutTab } from "./layout-tab";
import { MeetingTimesTab } from "./meeting-times-tab";

interface CourseEditorFormProps {
	onSubmit: (data: Course.Schema, form: UseFormReturn<Course.Schema>) => void;
	defaultValues?: PartialDeep<Course.Schema>;
}

export function CourseEditorForm({
	onSubmit,
	defaultValues,
}: CourseEditorFormProps) {
	const form = useForm<Course.Schema>({
		resolver: zodResolver(Course.schema),
		defaultValues: toMerged(
			{
				code: "",
				name: "",
				meetingTimes: [
					{
						day: 1,
						location: "",
						startTime: "10:00",
						endTime: "12:00",
					},
				],
				cellAppearance: {
					background: {
						type: "solid",
						color: "#3b82f6",
					},
					fgColor: "#ffffff",
					icon: {
						type: "emoji",
						emoji: "",
						svg: "",
						opacity: 0.7,
						rotation: 15,
						offsetX: 12,
						offsetY: 12,
						size: 3,
					},
				},
			} satisfies Course.Schema,
			defaultValues ?? {},
		),
	});

	const handleSubmit = (data: Course.Schema) => {
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

		onSubmit(data, form);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Main Content with Tabs */}
					<div className="flex-1 min-w-0">
						<Tabs defaultValue="details" className="w-full">
							<TabsList className="grid w-full grid-cols-5">
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="meeting-times">Meetings</TabsTrigger>
								<TabsTrigger value="appearance">Appearance</TabsTrigger>
								<TabsTrigger value="layout">Layout</TabsTrigger>
								<TabsTrigger value="icons">Icons</TabsTrigger>
							</TabsList>

							<div className="mt-6">
								<ScrollArea className="h-[60vh] pr-4">
									<TabsContent value="details" className="m-0">
										<CourseDetailsTab />
									</TabsContent>

									<TabsContent value="meeting-times" className="m-0">
										<MeetingTimesTab />
									</TabsContent>

									<TabsContent value="appearance" className="m-0">
										<AppearanceTab />
									</TabsContent>

									<TabsContent value="layout" className="m-0">
										<LayoutTab />
									</TabsContent>

									<TabsContent value="icons" className="m-0">
										<IconsTab />
									</TabsContent>
								</ScrollArea>
							</div>
						</Tabs>
					</div>

					{/* Preview Sidebar */}
					<div className="lg:w-80 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
						<CoursePreview />
					</div>
				</div>

				{/* Form Actions */}
				<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t">
					<div className="flex gap-3">
						<Button
							type="button"
							variant="ghost"
							onClick={() => form.reset()}
							className="flex-1 sm:flex-none"
						>
							Reset
						</Button>
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								className="flex-1 sm:flex-none"
							>
								Cancel
							</Button>
						</DialogClose>
					</div>
					<Button type="submit" className="flex-1 sm:flex-none">
						Save Course
					</Button>
				</div>

				<FormMessage />
			</form>
		</Form>
	);
}
