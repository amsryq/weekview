import { useSupportDialog } from "~/lib/contexts/support-dialog";
import { useIsUserSupporter } from "~/lib/hooks/user";

/**
 * Hook to check if user is a supporter and trigger support dialog if not.
 * Returns a function that can be called to check access to premium features.
 */
export function usePaywall() {
	const isSupporter = useIsUserSupporter();
	const { openSupportDialog } = useSupportDialog();

	/**
	 * Check if user has access to premium features.
	 * If not a supporter, opens the support dialog.
	 * @returns true if user is a supporter, false otherwise
	 */
	const checkAccess = (): boolean => {
		if (isSupporter) {
			return true;
		}

		openSupportDialog();
		return false;
	};

	return {
		isSupporter,
		checkAccess,
	};
}
