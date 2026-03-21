import { useEffect, useState } from "react";
import { Campus } from "../../../models/campus";
import { Faculty } from "../../../models/faculty";
import { CourseImportProgress } from "../utils/shared";

export type ImportPhase =
	| "idle"
	| "setup"
	| "importing"
	| "cancelled"
	| "complete";

export function useImporterState(importerOpen: boolean) {
	const [importPhase, setImportPhase] = useState<ImportPhase>("idle");
	const [campusInfo, setCampusInfo] = useState<{
		campus?: Campus;
		faculty?: Faculty;
	}>({});
	const [courseProgress, setCourseProgress] = useState<CourseImportProgress[]>(
		[],
	);
	const [progressDialogOpen, setProgressDialogOpen] = useState(false);

	useEffect(() => {
		if (!importerOpen) {
			setProgressDialogOpen(false);
			setImportPhase("idle");
			setCampusInfo({});
			setCourseProgress([]);
		}
	}, [importerOpen]);

	return {
		importPhase,
		setImportPhase,
		campusInfo,
		setCampusInfo,
		courseProgress,
		setCourseProgress,
		progressDialogOpen,
		setProgressDialogOpen,
	};
}
