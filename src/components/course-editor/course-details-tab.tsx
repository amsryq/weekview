import { useFormContext } from "react-hook-form";
import type { Course } from "~/lib/models/course";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

export function CourseDetailsTab() {
	const form = useFormContext<Course.Schema>();

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold">Course Details</h3>
				<p className="text-sm text-muted-foreground">
					Basic information about your course
				</p>
			</div>

			<div className="grid gap-4">
				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Course Code</FormLabel>
							<FormControl>
								<Input placeholder="CS110" {...field} />
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
							<FormLabel>Course Name</FormLabel>
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
			</div>
		</div>
	);
}
