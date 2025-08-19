import { Button } from "./components/ui/button";
import WeeklyTimetable from "./components/weekly-timetable";
import TechnoUniversityImporterDialog from "./lib/providers/techno-university-provider/importer-dialog";

function App() {
	return (
		<div className="container h-screen mx-auto p-4 w-full">
			<WeeklyTimetable />
			<TechnoUniversityImporterDialog>
				<Button className="m-4" size="lg">
					Import from Techno University
				</Button>
			</TechnoUniversityImporterDialog>
		</div>
	);
}

export default App;
