import Color from "color";
import { Pipette } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "~/lib/utils/styles";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
	/** Current color value (any CSS-parseable format) */
	value: string;
	/** Called on every change (drag, type, eyedropper) with a hex string */
	onChange: (hex: string) => void;
	/** If true, only commit on blur/enter for the text input (default: false) */
	deferTextCommit?: boolean;
	/** Additional class on the root wrapper */
	className?: string;
	/** Size variant */
	size?: "sm" | "default";
}

function normalizeToHex(raw: string): string | null {
	try {
		return Color(raw).hex().toLowerCase();
	} catch {
		return null;
	}
}

/**
 * A composable color picker widget with:
 * - A swatch button that opens a popover with a visual picker
 * - A text input for manual entry (hex, oklch, hsl, rgb, etc.)
 * - An optional eyedropper button (EyeDropper API)
 */
export function ColorPicker({
	value,
	onChange,
	deferTextCommit = false,
	className,
	size = "default",
}: ColorPickerProps) {
	const textId = useId();
	const [open, setOpen] = useState(false);

	// Track text draft separately so we don't clobber user typing
	const [draft, setDraft] = useState(value);
	const [lastExternal, setLastExternal] = useState(value);

	if (value !== lastExternal) {
		setDraft(value);
		setLastExternal(value);
	}

	const safeHex = useMemo(() => normalizeToHex(value) ?? "#000000", [value]);
	const isDraftValid = useMemo(() => normalizeToHex(draft) !== null, [draft]);

	const commitDraft = useCallback(() => {
		const hex = normalizeToHex(draft);
		if (!hex) {
			setDraft(value);
			return;
		}
		if (hex !== normalizeToHex(value)) {
			onChange(hex);
		}
		setDraft(hex);
	}, [draft, onChange, value]);

	const handlePickerChange = useCallback(
		(hex: string) => {
			onChange(hex);
			setDraft(hex);
		},
		[onChange],
	);

	const handleTextChange = useCallback(
		(text: string) => {
			setDraft(text);
			if (!deferTextCommit) {
				const hex = normalizeToHex(text);
				if (hex) {
					onChange(hex);
				}
			}
		},
		[deferTextCommit, onChange],
	);

	const handleEyeDropper = useCallback(async () => {
		if (!("EyeDropper" in window)) return;
		try {
			// @ts-expect-error - EyeDropper API is not in TS lib yet
			const dropper = new window.EyeDropper();
			const result = await dropper.open();
			const hex = normalizeToHex(result.sRGBHex);
			if (hex) {
				onChange(hex);
				setDraft(hex);
			}
		} catch {
			// User cancelled
		}
	}, [onChange]);

	const supportsEyeDropper =
		"window" in globalThis && "EyeDropper" in globalThis.window;

	const isSmall = size === "sm";
	const swatchBtnRef = useRef<HTMLButtonElement>(null);

	return (
		<div className={cn("flex items-center gap-2", className)}>
			{/* Swatch button → popover */}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						ref={swatchBtnRef}
						type="button"
						className={cn(
							"shrink-0 rounded-md border border-input shadow-xs transition-all",
							"hover:ring-2 hover:ring-ring/40 hover:ring-offset-1 hover:ring-offset-background",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
							isSmall ? "size-8" : "size-10",
						)}
						style={{ backgroundColor: safeHex }}
						aria-label="Pick color"
					/>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-3 space-y-3"
					align="start"
					sideOffset={8}
				>
					<HexColorPicker
						color={safeHex}
						onChange={handlePickerChange}
						style={{ width: "100%" }}
					/>

					<div className="flex items-center gap-2">
						{supportsEyeDropper && (
							<button
								type="button"
								onClick={handleEyeDropper}
								className={cn(
									"flex items-center justify-center rounded-md border border-input bg-background shadow-xs transition-colors",
									"hover:bg-accent hover:text-accent-foreground",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									"size-9 shrink-0",
								)}
								aria-label="Pick color from screen"
							>
								<Pipette className="size-4" />
							</button>
						)}
						<Input
							type="text"
							value={draft}
							onChange={(e) => handleTextChange(e.target.value)}
							onBlur={commitDraft}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									commitDraft();
								}
							}}
							className={cn(
								"font-mono text-xs uppercase h-9",
								!isDraftValid && "border-destructive/60",
							)}
							placeholder="#000000"
						/>
					</div>
				</PopoverContent>
			</Popover>

			{/* Inline text input */}
			<Input
				id={textId}
				type="text"
				value={draft}
				onChange={(e) => handleTextChange(e.target.value)}
				onBlur={commitDraft}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						commitDraft();
					}
				}}
				className={cn(
					"flex-1 font-mono uppercase",
					isSmall ? "h-8 text-xs" : "text-sm",
					!isDraftValid && "border-destructive/60",
				)}
				placeholder="#000000"
			/>
		</div>
	);
}
