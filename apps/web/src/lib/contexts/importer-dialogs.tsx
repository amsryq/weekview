import { createContext, ReactNode, use, useState } from "react";

interface ImporterDialogsContextType {
	openUiTMImporter: () => void;
	closeUiTMImporter: () => void;
	uiTMImporterOpen: boolean;
	openManualImporter: () => void;
	closeManualImporter: () => void;
	manualImporterOpen: boolean;
}

const ImporterDialogsContext = createContext<ImporterDialogsContextType | null>(
	null,
);

export function ImporterDialogsProvider({ children }: { children: ReactNode }) {
	const [uiTMImporterOpen, setUiTMImporterOpen] = useState(false);
	const [manualImporterOpen, setManualImporterOpen] = useState(false);

	return (
		<ImporterDialogsContext.Provider
			value={{
				openUiTMImporter: () => setUiTMImporterOpen(true),
				closeUiTMImporter: () => setUiTMImporterOpen(false),
				uiTMImporterOpen,
				openManualImporter: () => setManualImporterOpen(true),
				closeManualImporter: () => setManualImporterOpen(false),
				manualImporterOpen,
			}}
		>
			{children}
		</ImporterDialogsContext.Provider>
	);
}

export function useImporterDialogs() {
	const ctx = use(ImporterDialogsContext);
	if (!ctx)
		throw new Error(
			"useImporterDialogs must be used within ImporterDialogsProvider",
		);
	return ctx;
}
