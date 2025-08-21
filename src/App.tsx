import { domToPng } from "modern-screenshot";
import { Button } from "./components/ui/button";
import WeeklyTimetable from "./components/weekly-timetable";
import TechnoUniversityImporterDialog from "./lib/providers/techno-university-provider/importer-dialog";

function App() {
	// TODO: Export button instead or both and show save file picker?
	const handleDownloadPng = async () => {
		const node = document.querySelector(
			"#weekly-timetable",
		) as HTMLElement | null;

		if (!node) {
			// TODO: Should error and alert the user here
			return;
		}

		const padding = 16;
		const borderRadius = 8;

		const dataUrl = await domToPng(node, {
			scale: 3,
			// Needs recalculation because we're adding padding
			width: node.scrollWidth + padding * 2,
			height: node.scrollHeight + padding * 2,
			style: {
				backgroundColor: "white",
				padding: `${padding}px`,
				borderRadius: `${borderRadius}px`,
			},
		});

		const link = document.createElement("a");
		link.download = "timetable.png";
		link.href = dataUrl;
		link.click();
	};

	return (
		<div className="container h-screen mx-auto p-4 w-full">
			<WeeklyTimetable />
			<div className="m-4 flex flex-wrap gap-2">
				<Button onClick={handleDownloadPng} size="lg" variant="default">
					Download PNG
				</Button>
				<TechnoUniversityImporterDialog>
					<Button size="lg" variant="outline">
						Import from Techno University
					</Button>
				</TechnoUniversityImporterDialog>
			</div>
		</div>
	);
}

export default App;
