import { merge } from "es-toolkit";
import {
	ImageIcon,
	LayoutGridIcon,
	Palette,
	RotateCcwIcon,
	SwatchBook,
} from "lucide-react";
import { useState } from "react";
import type { PartialDeep } from "type-fest";
import { useStore } from "zustand";
import type { CellAppearance } from "~/lib/models/cell-appearance";
import { DEFAULT_TIMETABLE_STYLE_ID } from "~/lib/models/style";
import { CourseStore } from "~/lib/stores/course-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { PaywallOverlay } from "../paywall-overlay";
import { Button } from "../ui/button";
import {
	ResponsiveDialog,
	ResponsiveDialogClose,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "../ui/responsive-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BackgroundImageUpload } from "./background-image-upload";
import { CellAppearanceLayoutSettings } from "./cell-appearance-layout-settings";
import { StyleSelector } from "./style-selector";

export type TabValue = "styles" | "layout" | "background" | "cells";

interface TimetableCustomizerProps {
	children: React.ReactNode;
	initialTab?: TabValue;
}

export function TimetableCustomizer({
	children,
	initialTab,
}: TimetableCustomizerProps) {
	const prefs = useStore(TimetablePreferencesStore);
	const [activeTab, setActiveTab] = useState<TabValue>(initialTab ?? "styles");

	const handleCellAppearanceChange = (changes: PartialDeep<CellAppearance>) => {
		TimetablePreferencesStore.setState((writable) => {
			merge(writable.cellAppearance, changes);
		});
	};

	const handleReset = () => {
		TimetablePreferencesStore.getState().reset();
		CourseStore.getState().resetAllToStyle(DEFAULT_TIMETABLE_STYLE_ID);
	};

	return (
		<ResponsiveDialog>
			<ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
			<ResponsiveDialogContent
				desktopClassName="sm:max-w-2xl h-[600px] max-h-[85vh]"
				mobileClassName="h-[75vh]"
			>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Customize Timetable</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Customize the appearance and layout of your timetable
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<div className="flex-1 flex flex-col min-h-0">
					<Tabs
						value={activeTab}
						onValueChange={(v) => setActiveTab(v as TabValue)}
						className="flex-1 flex flex-col min-h-0"
					>
						<div className="px-6 pt-2 pb-4">
							<TabsList className="w-full grid grid-cols-4 shrink-0">
								<TabsTrigger value="styles" className="gap-2">
									<SwatchBook className="size-4" />
									<span className="hidden sm:inline">Styles</span>
								</TabsTrigger>
								<TabsTrigger value="layout" className="gap-2">
									<LayoutGridIcon className="size-4" />
									<span className="hidden sm:inline">Layout</span>
								</TabsTrigger>
								<TabsTrigger value="background" className="gap-2">
									<ImageIcon className="size-4" />
									<span className="hidden sm:inline">Background</span>
								</TabsTrigger>
								<TabsTrigger value="cells" className="gap-2">
									<Palette className="size-4" />
									<span className="hidden sm:inline">Cell Layout</span>
								</TabsTrigger>{" "}
							</TabsList>
						</div>

						<div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
							<TabsContent value="styles" className="mt-0">
								<StyleSelector />
							</TabsContent>

							<TabsContent value="layout" className="mt-0 space-y-6">
								<LayoutSettings
									layout={prefs.layout}
									onLayoutChange={(layout) => prefs.setValue("layout", layout)}
								/>
							</TabsContent>

							<TabsContent value="background" className="mt-0">
								<PaywallOverlay
									title="Premium Feature"
									description="Background images are available for supporters only."
									className="rounded-lg"
								>
									<BackgroundSettings
										backgroundImage={prefs.backgroundImage}
										backgroundImageOptions={prefs.backgroundImageOptions}
										onBackgroundImageChange={prefs.setBackgroundImage}
										onBackgroundImageOptionsChange={
											prefs.setBackgroundImageOptions
										}
									/>
								</PaywallOverlay>
							</TabsContent>

							<TabsContent value="cells" className="mt-0">
								<CellAppearanceLayoutSettings
									value={prefs.cellAppearance}
									onChange={handleCellAppearanceChange}
								/>
							</TabsContent>
						</div>
					</Tabs>
				</div>

				<div className="flex justify-between gap-2 p-6 border-t mt-auto">
					<Button variant="ghost" size="sm" onClick={handleReset}>
						<RotateCcwIcon className="size-4 mr-2" />
						Reset to defaults
					</Button>
					<ResponsiveDialogClose asChild>
						<Button>Done</Button>
					</ResponsiveDialogClose>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}

interface LayoutSettingsProps {
	layout: "rows" | "columns";
	onLayoutChange: (layout: "rows" | "columns") => void;
}

function LayoutSettings({ layout, onLayoutChange }: LayoutSettingsProps) {
	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-sm font-medium mb-2">Table Layout</h4>
				<p className="text-xs text-muted-foreground mb-4">
					Choose how your timetable is organized
				</p>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<LayoutOption
					title="Horizontal"
					description="Days as rows"
					isSelected={layout === "rows"}
					onClick={() => onLayoutChange("rows")}
					icon={<HorizontalLayoutIcon />}
				/>
				<LayoutOption
					title="Vertical"
					description="Days as columns"
					isSelected={layout === "columns"}
					onClick={() => onLayoutChange("columns")}
					icon={<VerticalLayoutIcon />}
				/>
			</div>
		</div>
	);
}

interface LayoutOptionProps {
	title: string;
	description: string;
	isSelected: boolean;
	onClick: () => void;
	icon: React.ReactNode;
}

function LayoutOption({
	title,
	description,
	isSelected,
	onClick,
	icon,
}: LayoutOptionProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`
				flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
				${
					isSelected
						? "border-primary bg-primary/5"
						: "border-muted hover:border-muted-foreground/30"
				}
			`}
		>
			<div
				className={`p-2 rounded-md ${isSelected ? "text-primary" : "text-muted-foreground"}`}
			>
				{icon}
			</div>
			<div className="text-center">
				<div className="text-sm font-medium">{title}</div>
				<div className="text-xs text-muted-foreground">{description}</div>
			</div>
		</button>
	);
}

function HorizontalLayoutIcon() {
	return (
		<svg
			className="size-8"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
		>
			<rect x="2" y="4" width="20" height="4" rx="1" />
			<rect x="2" y="10" width="20" height="4" rx="1" />
			<rect x="2" y="16" width="20" height="4" rx="1" />
		</svg>
	);
}

function VerticalLayoutIcon() {
	return (
		<svg
			className="size-8"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
		>
			<rect x="3" y="2" width="5" height="20" rx="1" />
			<rect x="10" y="2" width="5" height="20" rx="1" />
			<rect x="17" y="2" width="5" height="20" rx="1" />
		</svg>
	);
}

interface BackgroundSettingsProps {
	backgroundImage: string | null;
	backgroundImageOptions: { opacity: number };
	onBackgroundImageChange: (imageUrl: string | null) => void;
	onBackgroundImageOptionsChange: (options: { opacity?: number }) => void;
}

function BackgroundSettings({
	backgroundImage,
	backgroundImageOptions,
	onBackgroundImageChange,
	onBackgroundImageOptionsChange,
}: BackgroundSettingsProps) {
	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-sm font-medium mb-2">Background Image</h4>
				<p className="text-xs text-muted-foreground mb-4">
					Set a custom background for your timetable
				</p>
			</div>

			<BackgroundImageUpload
				value={backgroundImage}
				onChange={onBackgroundImageChange}
				options={backgroundImageOptions}
				onOptionsChange={onBackgroundImageOptionsChange}
			/>
		</div>
	);
}
