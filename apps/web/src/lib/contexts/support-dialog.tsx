import { toMerged } from "es-toolkit";
import { createContext, useContext, useRef, useState } from "react";

type SupportDialogConfig = {
	title: string;
	description: string;
	showAlternatives: boolean;
};

type SupportDialogContextType = {
	isOpen: boolean;
	config: SupportDialogConfig;
	openSupportDialog: (config?: Partial<SupportDialogConfig>) => void;
	closeSupportDialog: () => void;
};

const SupportDialogContext = createContext<
	SupportDialogContextType | undefined
>(undefined);

const DefaultConfig = {
	title: "Support the Project",
	description:
		"Weekview is a side project I've been building with love. If it's been helpful to you, consider supporting its development—it helps keep the project alive and growing!",
	showAlternatives: false,
};

export function SupportDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);

	const config = useRef<SupportDialogConfig>(DefaultConfig);
	const openSupportDialog = (_config?: Partial<SupportDialogConfig>) => {
		config.current = toMerged(DefaultConfig, _config ?? {});
		setIsOpen(true);
	};

	const closeSupportDialog = () => setIsOpen(false);

	return (
		<SupportDialogContext.Provider
			value={{
				isOpen,
				get config() {
					return config.current;
				},
				openSupportDialog,
				closeSupportDialog,
			}}
		>
			{children}
		</SupportDialogContext.Provider>
	);
}

export function useSupportDialog() {
	const context = useContext(SupportDialogContext);
	if (!context) {
		throw new Error(
			"useSupportDialog must be used within a SupportDialogProvider",
		);
	}
	return context;
}
