import { Course } from "~/lib/models/course";
import { UiTMProvider } from "./provider";

type UiTMCourseConstructorProps = Omit<
	ConstructorParameters<typeof Course>[0],
	"provider"
> & {
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
		super({ ...props, provider: UiTMProvider.instance });
		this.internal = {
			code: props.code,
			campus: props.campus,
			faculty: props.faculty,
			group: props.group,
		};
	}
}
