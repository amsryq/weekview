import { toast } from "sonner";

export async function fetchFromBackend(
	endpoint: string,
	options?: RequestInit,
) {
	// try {
	// 	if (!endpoint.startsWith("/providers/uitm/icress/")) throw null;

	// 	if (
	// 		// @ts-expect-error
	// 		globalThis.__DISABLE_BACKEND_INDEX__ === true ||
	// 		process.env.NODE_ENV !== "production"
	// 	)
	// 		throw null;

	// 	const url = new URL(endpoint, process.env.NEXT_PUBLIC_BACKEND_URL);
	// 	let indexPath = url.pathname;

	// 	if (url.search) {
	// 		// turn ?a=1&b=2 into __a_1__b_2
	// 		const querySuffix = url.search
	// 			.slice(1) // remove leading "?"
	// 			.replace(/&/g, "__") // & → __
	// 			.replace(/=/g, "_"); // = → _

	// 		indexPath += `__${querySuffix}`;
	// 	}

	// 	const indexPrefix = process.env.NEXT_PUBLIC_BACKEND_INDEX_URL;

	// 	const res = await fetch(indexPrefix + indexPath.slice(1), {
	// 		...options,
	// 		cache: "no-store",
	// 	});

	// 	if (res.status !== 200) throw null;

	// 	const data = await res.text();

	// 	const lines = data.split("\n");
	// 	const timestampStr = lines[0];
	// 	const actualData = lines.slice(1).join("\n");

	// 	const timestamp = Number(timestampStr);
	// 	const currentTime = Math.floor(Date.now() / 1000);

	// 	if (Math.abs(currentTime - timestamp) > 3600) {
	// 		throw null;
	// 	}

	// 	return new Response(actualData, {
	// 		status: res.status,
	// 		statusText: res.statusText,
	// 		headers: res.headers,
	// 	});
	// } catch {
	const response = await fetch(
		new URL(endpoint, import.meta.env.VITE_BACKEND_URL),
		{
			...options,
			credentials: "include",
		},
	);

	if (!response.ok) {
		const iCressStatusCode = response.headers.get("X-Icress-Status-Code");
		const iCressNonOk = iCressStatusCode
			? !(
				Number.parseInt(iCressStatusCode) >= 200 &&
				Number.parseInt(iCressStatusCode) < 300
			)
			: false;

		if (iCressNonOk) {
			toast.error(
				"An error occurred on the iCress server. Server returned code " +
				iCressStatusCode,
				{
					id: "ERR_ICRESS_" + iCressStatusCode,
				},
			);
		} else {
			toast.error("An error occurred while communicating with the backend.", {
				id: "ERR_BACKEND_COMM",
			});
		}

		throw new Error("Failed to reach the backend: " + response.statusText);
	}

	return response;
	// }
}
