import { createContext, type ReactNode, use, useState } from "react";

interface CourseManagementSheetContextType {
	openSheet: () => void;
	closeSheet: () => void;
	/** Internal — consumed by CourseManagementSheetRenderer. Do not use in application code. */
	_internal: {
		isOpen: boolean;
		setIsOpen: (open: boolean) => void;
	};
}

const CourseManagementSheetContext =
	createContext<CourseManagementSheetContextType | null>(null);

export function CourseManagementSheetProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<CourseManagementSheetContext.Provider
			value={{
				openSheet: () => setIsOpen(true),
				closeSheet: () => setIsOpen(false),
				_internal: { isOpen, setIsOpen },
			}}
		>
			{children}
		</CourseManagementSheetContext.Provider>
	);
}

export function useCourseManagementSheet() {
	const ctx = use(CourseManagementSheetContext);
	if (!ctx)
		throw new Error(
			"useCourseManagementSheet must be used within CourseManagementSheetProvider",
		);
	return ctx;
}
