import { AlertTriangleIcon, X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

function UnaffiliationNotice() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return (
		<Alert className="relative flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left text-primary-foreground shadow-sm dark:border-primary/40 dark:bg-primary/10">
			<span className="mt-1 rounded-full bg-primary/15 p-2 text-primary">
				<AlertTriangleIcon className="size-4" />
			</span>
			<div className="space-y-1">
				<AlertTitle className="flex justify-between text-sm font-semibold text-primary">
					Weekview isn&apos;t affiliated with UiTM
					<button
						className="text-primary"
						onClick={() => setIsVisible(false)}
						aria-label="Dismiss notice"
					>
						<X className="size-4" />
					</button>
				</AlertTitle>
				<AlertDescription className="block text-sm text-muted-foreground">
					Double-check your timetable in official portals like iCress or
					MyStudent. If something looks off, let us know via
					<a
						className="ml-1 inline-flex items-center gap-1 underline"
						href="https://t.me/myweekview"
					>
						our Telegram DMs
					</a>
					.
				</AlertDescription>
			</div>
		</Alert>
	);
}

export { UnaffiliationNotice };
