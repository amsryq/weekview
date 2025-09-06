import { useFormContext } from "react-hook-form";
import type { Course } from "~/lib/models/course";
import { ColorSelectorGrid } from "../settings/color-selector-grid";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

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

			<FormField
				control={form.control}
				name="cellAppearance.background"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Background Color</FormLabel>
						<FormControl>
							<ColorSelectorGrid
								value={field.value}
								onChange={field.onChange}
							/>
						</FormControl>
						<FormDescription>
							Choose a background for your course (solid color or gradient)
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

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
