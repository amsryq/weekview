import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

function UnaffiliationNotice() {
	return (
		<div className="w-full flex mt-2 justify-center">
			<div className="w-full max-w-lg">
				<Alert className="text-left border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
					<AlertTriangleIcon />
					<AlertTitle>Notice</AlertTitle>
					<AlertDescription className="inline text-yellow-700 dark:text-yellow-300">
						Weekview is not affiliated with or endorsed by UiTM. Please use this
						feature with discretion and verify your timetable against official
						sources (iCress). While the data is sourced from UiTM, it may be
						incomplete or outdated.
						<br />
						<br />
						If you encounter any issues (missing courses, incorrect timings),
						please report them on{" "}
						<a className="underline" href="https://t.me/myweekview">
							our Telegram channel's DM
						</a>
						.
					</AlertDescription>
				</Alert>
			</div>
		</div>
	);
}

export { UnaffiliationNotice };
