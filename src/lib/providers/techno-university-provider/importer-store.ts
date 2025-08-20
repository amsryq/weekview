import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { campuses, faculties } from "./mock-data.ts";
import { type Campus, type Faculty } from "./types.ts";

interface State {
	selectedCampus: Campus;
	selectedFaculty?: Faculty;
	selectedCourse: string;
}

interface Actions {
	update: (patch: Partial<State>) => void;
	reset: () => void;
}

const initialState: State = {
	selectedCampus: campuses[0],
	selectedFaculty: undefined,
	selectedCourse: "",
};

export const TechnoImporterStore = createStore<State & Actions>()(
	immer((set) => ({
		...initialState,

		update: (patch) =>
			set((state) => {
				Object.assign(state, patch);

				const campusFaculties = faculties[state.selectedCampus.id];
				if (
					state.selectedFaculty &&
					!campusFaculties?.some(
						(f: Faculty) => f.id === state.selectedFaculty?.id,
					)
				) {
					state.selectedFaculty = undefined;
				}
			}),

		reset: () => set({ ...initialState }),
	})),
);
