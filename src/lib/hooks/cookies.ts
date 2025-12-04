import { useEffect, useState } from "react";

// amsryq: vibecoded this function, looks alright to me

export function useCookie(name: string): string | undefined {
	const [cookieValue, setCookieValue] = useState<string | undefined>(undefined);

	useEffect(() => {
		// Check if CookieStore API is available
		if (!("cookieStore" in window)) {
			console.warn(
				"CookieStore API not supported, falling back to document.cookie",
			);

			// Fallback to document.cookie parsing
			const getCookieFromDocument = () => {
				const value = `; ${document.cookie}`;
				const parts = value.split(`; ${name}=`);
				if (parts.length === 2) {
					return parts.pop()?.split(";").shift();
				}
				return undefined;
			};

			setCookieValue(getCookieFromDocument());
			return;
		}

		const initializeCookie = async () => {
			try {
				const cookie = await cookieStore.get(name);
				setCookieValue(cookie?.value);
			} catch (error) {
				console.error("Error reading cookie:", error);
				setCookieValue(undefined);
			}
		};

		initializeCookie();

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
			cookieStore.removeEventListener("change", handleCookieChange);
		};
	}, [name]);

	return cookieValue;
}
