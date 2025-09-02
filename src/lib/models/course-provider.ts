import React, { JSX } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { CourseStore } from "../stores/course-store";
import { randomUUID } from "../utils";
import type { Course } from "./course";

export abstract class CourseProvider {
	public id: string;
	public name: string;

	constructor(data: {
		name: string;
		courses?: Course[];
		id?: string;
	}) {
		this.id = randomUUID();
		this.name = data.name;
	}

	public useCourses() {
		return useStore(
			CourseStore,
			useShallow((s) => s.courses.filter((c) => c.provider === this)),
		);
	}

	public getCourses() {
		return CourseStore.getState().courses.filter((c) => c.provider === this);
	}

	public abstract sync(): Promise<void>;

	public abstract renderAddCourseButton(): JSX.Element;
}
