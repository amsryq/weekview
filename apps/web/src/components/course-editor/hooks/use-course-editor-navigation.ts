import { useBlocker } from "@tanstack/react-router";

interface UseCourseEditorNavigationProps {
	isDirty: boolean;
	isSubmitSuccessful: boolean;
}

export function useCourseEditorNavigation({
	isDirty,
	isSubmitSuccessful,
}: UseCourseEditorNavigationProps) {
	useBlocker({
		shouldBlockFn: () => {
			if (!isDirty || isSubmitSuccessful) return false;
			return !window.confirm(
				"You have unsaved changes in the editor. Are you sure you want to leave?",
			);
		},
		enableBeforeUnload: () => isDirty && !isSubmitSuccessful,
	});
}
