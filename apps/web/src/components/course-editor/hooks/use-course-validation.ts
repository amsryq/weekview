import { toast } from "sonner";
import { CourseFormApi } from "~/lib/contexts/course-editor";
import { Course } from "~/lib/models/course";
import { MeetingTime } from "~/lib/models/meeting-time";

export function validateMeetingTimeConflicts(
	value: Course.Schema,
): string | undefined {
	const meetingObjs = value.meetingTimes.map((mt) =>
		MeetingTime.createFromSchema(mt),
	);
	for (let i = 0; i < meetingObjs.length; i++) {
		for (let j = i + 1; j < meetingObjs.length; j++) {
			if (meetingObjs[i].overlaps(meetingObjs[j])) {
				return `Meeting #${i + 1} conflicts with meeting #${j + 1}.`;
			}
		}
	}
	return undefined;
}

function hasErrorMapErrors(
	errorMap: CourseFormApi["state"]["errorMap"] | undefined,
) {
	return Object.values(errorMap ?? {}).some((error) => {
		if (Array.isArray(error)) return error.length > 0;
		return error !== undefined && error !== null && error !== "";
	});
}

function hasFieldErrors(
	fieldMeta: CourseFormApi["state"]["fieldMeta"] | undefined,
	predicate?: (name: string) => boolean,
) {
	return Object.entries(fieldMeta ?? {}).some(
		([name, meta]) =>
			(!predicate || predicate(name)) && (meta?.errors?.length ?? 0) > 0,
	);
}

export function useCourseValidation(form: CourseFormApi) {
	const getTabErrors = (
		fieldMeta: CourseFormApi["state"]["fieldMeta"],
		errorMap: CourseFormApi["state"]["errorMap"],
	) => {
		const basicsHasErrors =
			hasErrorMapErrors(errorMap) ||
			hasFieldErrors(
				fieldMeta,
				(name) =>
					name.startsWith("code") ||
					name.startsWith("name") ||
					name.startsWith("meetingTimes"),
			);
		const styleHasErrors = hasFieldErrors(
			fieldMeta,
			(name) =>
				name.startsWith("cellAppearance") &&
				!name.startsWith("cellAppearance.icon"),
		);
		const iconHasErrors = hasFieldErrors(fieldMeta, (name) =>
			name.startsWith("cellAppearance.icon"),
		);

		return { basicsHasErrors, styleHasErrors, iconHasErrors };
	};

	const validateForm = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		await form.handleSubmit();

		if (
			hasFieldErrors(form.state.fieldMeta) ||
			hasErrorMapErrors(form.state.errorMap)
		) {
			toast.error("Could not save course", {
				description: "Please fix the errors in the form and try again.",
			});
		}
	};

	return { getTabErrors, validateForm, validateMeetingTimeConflicts };
}
