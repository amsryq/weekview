import type { ComponentProps } from "react";
import type { Combobox } from "~/components/ui/shadcn-io/combobox";
import type { Clock } from "~/lib/models/clock";

export type ComboboxData = ComponentProps<typeof Combobox>["data"][number];

export interface ServerCampus {
	code: string;
	name: string;
	requiresFaculty: boolean;
}

export interface ServerFaculty {
	code: string;
	name: string;
}

export interface ServerCourse {
	code: string;
	path: string;
}

export interface ServerTimetableRowData {
	day: number;
	startTime: Clock;
	endTime: Clock;
	group: string;
	mode: string;
	status: string;
	room: string | null;
}

export interface ServerTimetableData {
	course: string;
	campus: string;
	rows: ServerTimetableRowData[];
}
