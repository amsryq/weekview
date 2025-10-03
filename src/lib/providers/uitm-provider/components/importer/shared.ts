import { create } from "zustand";
import { MeetingTime } from "~/lib/models/meeting-time";
import { Campus } from "../../models/campus";
import { Course } from "../../models/course";
import { Faculty } from "../../models/faculty";
import { ScheduleInfo } from "../../utils/parse-schedule";

export const SHORT_DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export type ProgressStatus = "running" | "success" | "error";

export interface ProgressItem {
	id: string;
	label: string;
	status: ProgressStatus;
	detail?: string;
}

export interface ImportSuccess {
	courseCode: string;
	group: string;
}

export interface ImportFailure {
	courseCode: string;
	group: string;
	reason: string;
}

export interface ImportResult {
	schedule: ScheduleInfo;
	campus: Campus;
	faculty?: Faculty;
	successes: ImportSuccess[];
	failures: ImportFailure[];
}

export const useImporterSelectionStore = create<{
	open: boolean;
	currentStep: number;
	selectedCampus?: Campus;
	selectedFaculty?: Faculty;
	selectedCourse?: Course;
	setOpen: (open: boolean) => void;
	setCurrentStep: (step: number) => void;
	setSelectedCampus: (c?: Campus) => void;
	setSelectedFaculty: (f?: Faculty) => void;
	setSelectedCourse: (c?: Course) => void;
}>((set) => ({
	open: false,
	currentStep: 0,
	selectedCampus: undefined,
	selectedFaculty: undefined,
	selectedCourse: undefined,
	setOpen: (open) => set({ open }),
	setCurrentStep: (step) => set({ currentStep: step }),
	setSelectedCampus: (c) =>
		set({
			selectedCampus: c,
			selectedFaculty: undefined,
			selectedCourse: undefined,
		}),
	setSelectedFaculty: (f) =>
		set({
			selectedFaculty: f,
			selectedCourse: undefined,
		}),
	setSelectedCourse: (c) => set({ selectedCourse: c }),
}));

export const normalizeString = (value: string): string =>
	value.replace(/\s+/g, "").trim().toLowerCase();

export function summarizeMeetingTimes(meetingTimes: MeetingTime[]): string {
	return meetingTimes
		.map((meeting) => {
			const day = SHORT_DAY_NAMES[(meeting.day - 1 + 7) % 7] ?? "";
			const timeRange = `${meeting.time.start.toString()}-${meeting.time.end.toString()}`;
			return `${day} ${timeRange}`.trim();
		})
		.join(" • ");
}
