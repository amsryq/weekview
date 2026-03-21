import { randomUUID } from "../utils/random";
import type { Course } from "./course";

export abstract class CourseProvider {
	public id: string;
	public name: string;
	public emptyStateText?: string;

	constructor(data: {
		name: string;
		courses?: Course[];
		id?: string;
		emptyStateText?: string;
	}) {
		this.id = randomUUID();
		this.name = data.name;
		this.emptyStateText = data.emptyStateText;
	}

	public abstract sync(): Promise<void>;
}
