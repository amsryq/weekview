import { createContext, use, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	storageKey: string;
	defaultTheme?: Theme;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	applyingTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
	applyingTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function setThemeAttr(theme: Theme) {
	const root = window.document.documentElement;

	root.classList.remove("light", "dark");
	if (theme === "system") {
		const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
			.matches
			? "dark"
			: "light";

		root.classList.add(systemTheme);
		return;
	}

	root.classList.add(theme);
}

function isTheme(cause: unknown): cause is Theme {
	return cause === "dark" || cause === "light" || cause === "system";
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey,
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		if ("window" in globalThis && "localStorage" in globalThis) {
			const storedTheme = localStorage.getItem(storageKey);
			if (isTheme(storedTheme)) return storedTheme;
		}
		return defaultTheme;
	});

	useEffect(() => {
		setThemeAttr(theme);
		if (theme === "system") {
			// Listen for system theme changes
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			const handleChange = (e: MediaQueryListEvent) => {
				setThemeAttr(e.matches ? "dark" : "light");
			};
			mediaQuery.addEventListener("change", handleChange);
			return () => mediaQuery.removeEventListener("change", handleChange);
		}
	}, [theme]);

	const value = {
		theme,
		setTheme: (nextTheme: Theme) => {
			if ("window" in globalThis && "localStorage" in globalThis) {
				localStorage.setItem(storageKey, nextTheme);
			}
			setTheme(nextTheme);
		},
		get applyingTheme() {
			if (theme === "system") {
				return "window" in globalThis &&
					window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light";
			}
			return theme;
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = use(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
