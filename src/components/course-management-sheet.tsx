import { Button } from "./ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";

function Body() {
	return null;
}

export default function CourseManagementSheet() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Manage Courses</Button>
			</SheetTrigger>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>Course Management</SheetTitle>
					<SheetDescription>
						Manage your selected courses here.
					</SheetDescription>
				</SheetHeader>
				<Body />
				<SheetFooter>
					<Button type="submit">Save changes</Button>
					<SheetClose asChild>
						<Button variant="outline">Close</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
