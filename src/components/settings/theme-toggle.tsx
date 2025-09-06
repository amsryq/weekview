"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/contexts/themes";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon"
					variant="outline"
					onContextMenu={(e) => {
						if (process.env.NODE_ENV !== "development") {
							return;
						}

						e.preventDefault();

						if (theme === "light") {
							setTheme("dark");
						} else if (theme === "dark") {
							setTheme("light");
						} else {
							const currentSystem = window.matchMedia(
								"(prefers-color-scheme: dark)",
							).matches;

							if (currentSystem) setTheme("light");
							else setTheme("dark");
						}
					}}
				>
					<span className="relative flex items-center w-2 h-2 mr-2">
						<Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					<Sun className="mr-2 h-4 w-4" />
					<span>Light</span>
					{theme === "light" && <span className="ml-auto">✓</span>}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					<Moon className="mr-2 h-4 w-4" />
					<span>Dark</span>
					{theme === "dark" && <span className="ml-auto">✓</span>}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					<Monitor className="mr-2 h-4 w-4" />
					<span>System</span>
					{theme === "system" && <span className="ml-auto">✓</span>}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// Simple toggle button version (cycles through light -> dark -> system)
export function SimpleThemeToggle() {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		if (theme === "light") {
			setTheme("dark");
		} else if (theme === "dark") {
			setTheme("system");
		} else {
			setTheme("light");
		}
	};

	const getIcon = () => {
		if (theme === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />;
		if (theme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem]" />;
		return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
	};

	return (
		<Button variant="outline" size="icon" onClick={toggleTheme}>
			{getIcon()}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
