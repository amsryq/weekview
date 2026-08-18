import { Info, X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

function SemesterEndNotice() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return (
		<Alert className="relative rounded-xl border border-amber-500/30 bg-amber-50 shadow-none transition-colors dark:border-amber-500/30 dark:bg-amber-500/10">
			<Info className="size-4 text-amber-600 dark:text-amber-400" />
			<AlertTitle className="line-clamp-none text-sm font-bold text-amber-900 dark:text-amber-200">
				This feature might not work properly for now
			</AlertTitle>
			<AlertDescription className="text-sm leading-relaxed inline text-amber-900/80 dark:text-amber-100/90">
				Since the semester is ending, UiTM portals are currently not up, so
				importing might not work properly until they are back online.
			</AlertDescription>
			<button
				type="button"
				className="absolute right-3 top-3 text-amber-700/60 hover:text-amber-700 transition-colors dark:text-amber-400/60 dark:hover:text-amber-400"
				onClick={() => setIsVisible(false)}
				aria-label="Dismiss notice"
			>
				<X className="size-3.5" />
			</button>
		</Alert>
	);
}

export { SemesterEndNotice };
