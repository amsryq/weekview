import { useEffect, useState } from "react";
import type { ImporterStep } from "./shared";

export type SourceKey = Extract<
	ImporterStep,
	"my-student" | "campus-faculty" | "course-slip"
>;

export interface SourceStatus {
	available: boolean;
	unavailableReason?: string;
}

const STATIC_SOURCE_STATUS: Record<SourceKey, SourceStatus> = {
	"my-student": { available: true },
	"campus-faculty": { available: true },
	"course-slip": { available: true },
};

type SourceStatusProvider = () =>
	| Record<SourceKey, SourceStatus>
	| Promise<Record<SourceKey, SourceStatus>>;

let provider: SourceStatusProvider = () => STATIC_SOURCE_STATUS;

export function setSourceStatusProvider(p: SourceStatusProvider) {
	provider = p;
}

export function useSourceStatuses() {
	const [statuses, setStatuses] =
		useState<Record<SourceKey, SourceStatus>>(STATIC_SOURCE_STATUS);

	useEffect(() => {
		let isMounted = true;
		const result = provider();

		if (result instanceof Promise) {
			result
				.then((resolved) => {
					if (isMounted) setStatuses(resolved);
				})
				.catch((error) => {
					console.error("Failed to fetch source statuses", error);
				});
		} else {
			setStatuses(result);
		}

		return () => {
			isMounted = false;
		};
	}, []);

	return statuses;
}
