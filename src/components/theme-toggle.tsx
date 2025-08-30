"use client";

import { capitalize } from "es-toolkit";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/hooks/themes";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<span className="relative flex items-center justify-center w-2 h-2 mr-2">
						<Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					</span>
					{capitalize(theme)}
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
