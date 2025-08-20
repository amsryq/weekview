import { Course } from "~/lib/models/course";
import { TechnoUniversityProvider } from ".";

type TechnoCourseConstructorProps = ConstructorParameters<typeof Course>[0] & {
	group: string;
	campus: string;
	faculty?: string;
};

export class TechnoCourse extends Course {
	// Course#code can be mutated by the user, so we store this so we can perform refetch later
	public initialCode: string;
	public campus: string;
	public faculty?: string;
	public group: string;

	constructor(props: TechnoCourseConstructorProps) {
		super(props);
		this.initialCode = props.code;
		this.campus = props.campus;
		this.faculty = props.faculty;
		this.group = props.group;
		this.provider = TechnoUniversityProvider.instance;
	}
}
