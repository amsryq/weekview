import { AlertTriangleIcon, X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

function UnaffiliationNotice() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return (
		<Alert className="relative rounded-xl border border-primary/20 bg-primary/5 shadow-none transition-colors dark:border-primary/30 dark:bg-primary/10">
			<AlertTriangleIcon className="size-4 text-primary" />
			<AlertTitle className="line-clamp-none text-sm font-bold text-primary">
				Not affiliated with UiTM
			</AlertTitle>
			<AlertDescription className="text-xs leading-normal inline text-muted-foreground/90">
				Always verify your timetable in official portals. If anything is wrong,
				reach out via{" "}
				<a
					className="font-medium underline-offset-2 hover:underline text-primary"
					href="https://t.me/myweekview"
					target="_blank"
					rel="noreferrer"
				>
					Telegram
				</a>
				.
			</AlertDescription>
			<button
				type="button"
				className="absolute right-3 top-3 text-primary/60 hover:text-primary transition-colors"
				onClick={() => setIsVisible(false)}
				aria-label="Dismiss notice"
			>
				<X className="size-3.5" />
			</button>
		</Alert>
	);
}

export { UnaffiliationNotice };
