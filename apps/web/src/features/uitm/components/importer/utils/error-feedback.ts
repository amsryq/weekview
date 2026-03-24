function toRawMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	return "An unexpected error occurred.";
}

function parseServiceStatus(message: string): {
	service: "icress" | "mystudent";
	status: number;
} | null {
	const match = message.match(/(icress|mystudent)\s+returned\s+(\d{3})/i);
	if (!match) return null;

	const service = match[1]?.toLowerCase();
	const statusText = match[2];
	if (!service || !statusText) return null;

	const status = Number.parseInt(statusText, 10);
	if (Number.isNaN(status)) return null;

	if (service !== "icress" && service !== "mystudent") {
		return null;
	}

	return { service, status };
}

export function getFriendlyUiTMErrorMessage(error: unknown): string {
	const message = toRawMessage(error).trim();
	if (!message)
		return "Something went wrong while importing. Please try again.";

	if (/^import cancelled$/i.test(message)) {
		return "Import cancelled";
	}

	if (/duplicate/i.test(message)) {
		return "Duplicate entry found in your import data.";
	}

	if (/already in timetable/i.test(message)) {
		return "This group is already in your timetable.";
	}

	const conflictMatch = message.match(/conflicts? with\s+(.+)$/i);
	if (conflictMatch?.[1]) {
		return `Time conflict with ${conflictMatch[1]}.`;
	}

	if (/no timetable entries.*student id/i.test(message)) {
		return "No timetable was found for this student ID. Please check the ID and try again.";
	}

	if (/failed to fetch student timetable/i.test(message)) {
		return "Unable to load your timetable from UiTM MyStudent right now. Please try again shortly.";
	}

	const statusInfo = parseServiceStatus(message);
	if (statusInfo) {
		if (statusInfo.service === "mystudent" && statusInfo.status === 404) {
			return "No timetable was found for this student ID. Please check the ID and try again.";
		}

		if (statusInfo.status >= 500) {
			return statusInfo.service === "icress"
				? `UiTM iCress is temporarily unavailable (${statusInfo.status}). Please try again in a few minutes.`
				: `UiTM MyStudent is temporarily unavailable (${statusInfo.status}). Please try again in a few minutes.`;
		}

		if (statusInfo.service === "mystudent") {
			return `UiTM MyStudent rejected this request (${statusInfo.status}). Please verify your student ID and try again.`;
		}

		return `UiTM iCress rejected this request (${statusInfo.status}). Please try again.`;
	}

	if (/failed to fetch|networkerror|network error|timeout/i.test(message)) {
		return "Network issue while contacting UiTM services. Please check your connection and retry.";
	}

	if (/course not found/i.test(message)) {
		return "Course could not be found in UiTM data for the selected campus/faculty.";
	}

	if (/group not found/i.test(message)) {
		return "Group could not be found in UiTM data for that course.";
	}

	if (/group fetch failed/i.test(message)) {
		return "Unable to load groups for this course right now. Please retry.";
	}

	if (/unable to determine campus/i.test(message)) {
		return "Unable to determine the correct campus from your import data.";
	}

	if (/no courses detected/i.test(message)) {
		return "No courses were detected in the imported data.";
	}

	return message;
}
