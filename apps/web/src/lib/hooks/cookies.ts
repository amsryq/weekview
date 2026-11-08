import { useEffect, useState } from "react";

// amsryq: vibecoded this function, looks alright to me

function getCookieFromDocument(name: string): string | undefined {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop()?.split(";").shift();
	}
	return undefined;
}

export function useCookie(name: string): string | undefined {
	const [cookieValue, setCookieValue] = useState<string | undefined>(undefined);

	useEffect(() => {
		let isMounted = true;

		const initializeCookie = async () => {
			try {
				if (!("cookieStore" in window)) {
					console.warn(
						"CookieStore API not supported, falling back to document.cookie",
					);
					const fallback = getCookieFromDocument(name);
					if (isMounted) setCookieValue(fallback);
					return;
				}

				const cookie = await cookieStore.get(name);
				if (isMounted) setCookieValue(cookie?.value);
			} catch (error) {
				console.error("Error reading cookie:", error);
				if (isMounted) setCookieValue(undefined);
			}
		};

		initializeCookie();

		if (!("cookieStore" in window)) {
			return () => {
				isMounted = false;
			};
		}

		const handleCookieChange = (event: CookieChangeEvent) => {
			const changedCookie = event.changed.find(
				(cookie) => cookie.name === name,
			);
			const deletedCookie = event.deleted.find(
				(cookie) => cookie.name === name,
			);

			if (changedCookie) {
				setCookieValue(changedCookie.value);
			} else if (deletedCookie) {
				setCookieValue(undefined);
			}
		};

		cookieStore.addEventListener("change", handleCookieChange);

		return () => {
			isMounted = false;
			cookieStore.removeEventListener("change", handleCookieChange);
		};
	}, [name]);

	return cookieValue;
}
