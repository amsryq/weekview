import { Course } from "~/lib/models/course";
import { UiTMProvider } from "./provider";

type UiTMCourseConstructorProps = ConstructorParameters<typeof Course>[0] & {
	group: string;
	campus: string;
	faculty?: string;
};

export class UiTMCourseSection extends Course {
	public internal: {
		code: string;
		campus: string;
		faculty?: string;
		group: string;
	};

	constructor(props: UiTMCourseConstructorProps) {
		super(props);
		this.internal = {
			code: props.code,
			campus: props.campus,
			faculty: props.faculty,
			group: props.group,
		};
		this.provider = UiTMProvider.instance;
	}
}
