import { useDeferredValue, useMemo } from "react";
import { parseSchedule } from "../../../utils/parse-schedule";

export function useParsedSchedule(rawText: string) {
	const deferredRawText = useDeferredValue(rawText);
	return useMemo(() => parseSchedule(deferredRawText), [deferredRawText]);
}
