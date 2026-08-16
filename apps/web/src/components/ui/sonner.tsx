import { Toaster as Sonner, ToasterProps } from "sonner";
import { useTheme } from "~/lib/contexts/themes";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme } = useTheme();

	return (
		<Sonner
			// SAFETY: Theme context values align with Sonner theme options ("light" | "dark" | "system")
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			style={
				// SAFETY: Custom CSS properties matching Sonner theming variables
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
