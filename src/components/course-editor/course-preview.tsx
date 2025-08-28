import { useFormContext } from "react-hook-form";
import type { Course } from "~/lib/models/course";
import { Twemoji } from "../ui/twemoji";

export function CoursePreview() {
	const form = useFormContext<Course.Schema>();
	const formData = form.watch();

	const backgroundStyle = (() => {
		const bg = formData.cellAppearance?.background;
		if (!bg) return { backgroundColor: "#3b82f6" };

		if (bg.type === "solid") {
			return { backgroundColor: bg.color };
		} else if (bg.type === "gradient") {
			return {};
		}
		return { backgroundColor: "#3b82f6" };
	})();

	const iconElement = (() => {
		const icon = formData.cellAppearance?.icon;
		if (!icon) return null;

		const style = {
			opacity: icon.opacity || 0.7,
			transform: `rotate(${icon.rotation || 0}deg) scale(${icon.size || 1})`,
			position: "absolute" as const,
			top: `${icon.offsetY || 8}px`,
			right: `${icon.offsetX || 8}px`,
			fontSize: "1.5em",
		};

		if (icon.type === "emoji" && icon.emoji) {
			return <Twemoji emoji={icon.emoji} style={style} />;
		} else if (icon.type === "svg" && icon.svg) {
			return (
				<div style={style}>
					<img
						src={`data:image/svg+xml;utf8,${encodeURIComponent(icon.svg)}`}
						alt="Course icon"
						style={{ width: "1em", height: "1em" }}
					/>
				</div>
			);
		}
		return null;
	})();

	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-sm font-medium">Preview</h4>
				<p className="text-xs text-muted-foreground">
					See how your course will look in the timetable
				</p>
			</div>

			<div
				className="relative rounded-lg border p-4 min-h-24 overflow-hidden"
				style={{
					...backgroundStyle,
					color: formData.cellAppearance?.fgColor || "#ffffff",
				}}
			>
				{iconElement}
				<div className="space-y-1">
					<div className="font-semibold text-sm">
						{formData.code || "Course Code"}
					</div>
					<div className="text-xs opacity-90">
						{formData.name || "Course Name"}
					</div>
					{formData.meetingTimes && formData.meetingTimes.length > 0 && (
						<div className="text-xs opacity-75">
							{formData.meetingTimes[0].location || "Location"}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
