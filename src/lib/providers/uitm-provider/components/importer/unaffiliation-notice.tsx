import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

function UnaffiliationNotice() {
	return (
		<div className="w-full flex mt-2 justify-center">
			<div className="w-full max-w-lg">
				<Alert className="text-left border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400">
					<AlertTriangleIcon />
					<AlertTitle>Notice</AlertTitle>
					<AlertDescription className="inline text-foreground">
						Weekview is an independent tool and is not officially affiliated
						with or endorsed by UiTM. Please use this feature responsibly and
						always confirm your timetable with official sources such as iCress
						or myStudent. The data provided is based on UiTM iCress but{" "}
						<b>may be incomplete or outdated.</b>
						<br />
						<br />
						If you notice missing courses or incorrect timings from the{" "}
						<a className="underline" href="https://icress.uitm.edu.my">
							iCress
						</a>{" "}
						website, kindly report them via{" "}
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
