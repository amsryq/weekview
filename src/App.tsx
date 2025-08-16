import CourseManagementSheet from "./components/course-management-sheet";
import { Button } from "./components/ui/button";

function App() {
	return (
		<div className="flex justify-center items-center w-screen h-screen">
			<CourseManagementSheet>
				<Button>Manage Courses</Button>
			</CourseManagementSheet>
		</div>
	);
}

export default App;
