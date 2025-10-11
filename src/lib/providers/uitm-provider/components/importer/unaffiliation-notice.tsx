import { AlertTriangleIcon } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

function UnaffiliationNotice() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return (
		<div className="w-full flex justify-center mt-2">
			<Alert className="text-left border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400">
				<button
					className="absolute top-0 right-2 text-xl text-blue-600 dark:text-blue-400"
					onClick={() => setIsVisible(false)}
					aria-label="Dismiss notice"
				>
					&times;
				</button>
				<AlertTriangleIcon />
				<AlertTitle>Notice</AlertTitle>
				<AlertDescription className="inline text-foreground">
					Weekview is independent and not affiliated with UiTM. Please verify
					your timetable with official sources like iCress or MyStudent. Changes
					to UiTM's private APIs may result in inaccurate data. If you notice
					missing courses or incorrect timings, please report them via{" "}
					<a className="underline" href="https://t.me/myweekview">
						our Telegram channel's DM
					</a>
					.
				</AlertDescription>
			</Alert>
		</div>
	);
}

export { UnaffiliationNotice };
