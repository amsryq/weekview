import { Monitor, Moon, Pencil, Plus, Sun } from "lucide-react";
import { useState } from "react";
import { ColorEntry } from "~/lib/models/color-entry";
import { TIMETABLE_STYLES } from "~/lib/models/style";
import { cn } from "~/lib/utils/styles";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import {
	getDefaultStyleName,
	shouldReplaceAutoStyleName,
	useStyleSelectorActions,
	useStyleSelectorData,
} from "../hooks/use-style-selector-logic";
import { CustomStyleEditorDialog } from "./custom-style-editor";

export function StyleSelector() {
	const {
		activeStyleId,
		timetableThemePreference,
		timetableColorMode,
		styles,
		customStyleIds,
	} = useStyleSelectorData();
	const { applyStyle, setThemePreference, createStyleFromBuiltIn } =
		useStyleSelectorActions();

	const [editorStyleId, setEditorStyleId] = useState<string | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [createBaseStyleId, setCreateBaseStyleId] = useState(
		TIMETABLE_STYLES[0].id,
	);
	const [createStyleName, setCreateStyleName] = useState(
		getDefaultStyleName(TIMETABLE_STYLES[0].id),
	);

	const handleBaseStyleChange = (nextBaseStyleId: string) => {
		setCreateBaseStyleId(nextBaseStyleId);
		setCreateStyleName((currentName) =>
			shouldReplaceAutoStyleName(currentName)
				? getDefaultStyleName(nextBaseStyleId)
				: currentName,
		);
	};

	const handleCreateStyle = () => {
		const createdStyleId = createStyleFromBuiltIn(
			createBaseStyleId,
			createStyleName,
		);
		setCreateDialogOpen(false);
		setEditorStyleId(createdStyleId);
	};

	return (
		<>
			<div className="space-y-4">
				<div>
					<h4 className="text-sm font-medium mb-2">Styles</h4>
					<p className="text-xs text-muted-foreground mb-4">
						Styles control timetable colors, background, and fonts.
					</p>
				</div>

				<div className="flex items-center gap-2 justify-between">
					<span className="text-sm font-semibold text-foreground mr-2">
						Timetable theme
					</span>
					<div className="flex items-center gap-3">
						<div className="inline-flex rounded-md bg-muted p-1 border border-muted-foreground/10">
							<button
								type="button"
								aria-label="Follow app theme"
								className={cn(
									"px-2 py-1 rounded-md transition-colors",
									timetableThemePreference === "follow-app"
										? "bg-primary/90 text-primary-foreground shadow"
										: "hover:bg-muted-foreground/10 text-muted-foreground",
								)}
								onClick={() => setThemePreference("follow-app")}
							>
								<Monitor className="size-4" />
							</button>
							<button
								type="button"
								aria-label="Light mode"
								className={cn(
									"px-2 py-1 rounded-md transition-colors",
									timetableThemePreference === "light"
										? "bg-primary/90 text-primary-foreground shadow"
										: "hover:bg-muted-foreground/10 text-muted-foreground",
								)}
								onClick={() => setThemePreference("light")}
							>
								<Sun className="size-4" />
							</button>
							<button
								type="button"
								aria-label="Dark mode"
								className={cn(
									"px-2 py-1 rounded-md transition-colors",
									timetableThemePreference === "dark"
										? "bg-primary/90 text-primary-foreground shadow"
										: "hover:bg-muted-foreground/10 text-muted-foreground",
								)}
								onClick={() => setThemePreference("dark")}
							>
								<Moon className="size-4" />
							</button>
						</div>
					</div>
				</div>

				<div className="grid gap-3 sm:grid-cols-2">
					{styles.map((style) => {
						const isActive = style.id === activeStyleId;
						const previewColors = style.variants[
							timetableColorMode
						].gridColors.slice(0, 6);
						const isCustom = customStyleIds.has(style.id);

						return (
							<div key={style.id} className="relative">
								<button
									type="button"
									onClick={() => applyStyle(style.id)}
									className={cn(
										"rounded-lg border p-3 text-left transition-all w-full",
										isActive
											? "border-primary bg-primary/5"
											: "hover:border-muted-foreground/30",
									)}
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm font-semibold">{style.name}</p>
											<p
												className="text-xs text-muted-foreground"
												style={{
													fontFamily: `'${style.fontFamily}', sans-serif`,
												}}
											>
												{style.fontFamily}
											</p>
										</div>
									</div>
									<div className="mt-3 flex gap-1">
										{previewColors.map((color, index) => (
											<div
												key={`${style.id}-${index}`}
												className="h-5 w-5 rounded"
												style={ColorEntry.getBackgroundStyle(color)}
											/>
										))}
									</div>
								</button>
								{isCustom && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={`Edit ${style.name}`}
										className="absolute top-2 right-2 z-20"
										onClick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											setEditorStyleId(style.id);
										}}
									>
										<Pencil className="size-4" />
									</Button>
								)}
							</div>
						);
					})}

					<button
						type="button"
						onClick={() => setCreateDialogOpen(true)}
						className="rounded-lg border border-dashed p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
					>
						<div className="flex justify-center h-full flex-col">
							<div className="flex items-center gap-3 text-primary">
								<div className="flex flex-none grow size-9 items-center justify-center rounded-full bg-primary/10">
									<Plus className="size-5" />
								</div>
								<div>
									<p className="text-sm font-semibold text-foreground">
										Add style
									</p>
									<p className="text-xs text-muted-foreground">
										Start from a built-in style and customize everything.
									</p>
								</div>
							</div>
						</div>
					</button>
				</div>

				<p className="text-xs text-muted-foreground">
					Switching style resets per-course color/font overrides to the selected
					style.
				</p>
			</div>

			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create Style</DialogTitle>
						<DialogDescription>
							Pick a built-in style to copy, then customize it.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="new-style-name">Style name</Label>
							<Input
								id="new-style-name"
								value={createStyleName}
								onChange={(event) => setCreateStyleName(event.target.value)}
								placeholder="My style"
							/>
						</div>
						<div className="space-y-2">
							<Label>Base style</Label>
							<Select
								value={createBaseStyleId}
								onValueChange={handleBaseStyleChange}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{TIMETABLE_STYLES.map((style) => (
										<SelectItem key={style.id} value={style.id}>
											<span
												style={{
													fontFamily: `'${style.fontFamily}', sans-serif`,
												}}
											>
												{style.name}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setCreateDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button type="button" onClick={handleCreateStyle}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<CustomStyleEditorDialog
				styleId={editorStyleId}
				open={editorStyleId !== null}
				onOpenChange={(open) => {
					if (!open) {
						setEditorStyleId(null);
					}
				}}
			/>
		</>
	);
}
