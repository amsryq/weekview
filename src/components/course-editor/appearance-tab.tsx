import { useFormContext } from "react-hook-form";
import type { Course } from "~/lib/models/course";
import { CellBackgroundConfigurer } from "../cell-background-configurer";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function AppearanceTab() {
	const form = useFormContext<Course.Schema>();

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold">Appearance</h3>
				<p className="text-sm text-muted-foreground">
					Customize how your course looks in the timetable
				</p>
			</div>

			<Tabs defaultValue="solid-background" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="solid-background">Solid Background</TabsTrigger>
					<TabsTrigger value="gradient-background">
						Gradient Background
					</TabsTrigger>
				</TabsList>

				<TabsContent value="solid-background" className="space-y-6">
					<FormField
						control={form.control}
						name="cellAppearance.background"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Background</FormLabel>
								<FormControl>
									<CellBackgroundConfigurer
										value={field.value}
										onChange={field.onChange}
									/>
								</FormControl>
								<FormDescription>
									Choose a solid color background for your course
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</TabsContent>

				<TabsContent value="gradient-background" className="space-y-6">
					<FormField
						control={form.control}
						name="cellAppearance.background"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Gradient Background</FormLabel>
								<FormControl>
									<CellBackgroundConfigurer
										value={field.value}
										onChange={field.onChange}
									/>
								</FormControl>
								<FormDescription>
									Choose a gradient background for your course
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</TabsContent>
			</Tabs>

			<FormField
				control={form.control}
				name="cellAppearance.fgColor"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Text Color</FormLabel>
						<FormControl>
							<div className="flex items-center gap-3">
								<Input type="color" className="w-20 h-10 p-1" {...field} />
								<Input placeholder="#3b82f6" className="flex-1" {...field} />
							</div>
						</FormControl>
						<FormDescription>
							Choose a text color for your course
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
