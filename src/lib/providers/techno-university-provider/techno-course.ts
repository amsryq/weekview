import { Course } from "~/lib/models/course";
import { TechnoUniversityProvider } from ".";

type TechnoCourseConstructorProps = ConstructorParameters<typeof Course>[0] & {
	group: string;
	campus: string;
	faculty?: string;
};

export class TechnoCourse extends Course {
	public internal: {
		code: string;
		campus: string;
		faculty?: string;
		group: string;
	};

	constructor(props: TechnoCourseConstructorProps) {
		super(props);
		this.internal = {
			code: props.code,
			campus: props.campus,
			faculty: props.faculty,
			group: props.group,
		};
		this.provider = TechnoUniversityProvider.instance;
	}
}
