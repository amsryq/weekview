export async function fetchFromBackend(
	endpoint: string,
	options?: RequestInit,
) {
	try {
		if (!endpoint.startsWith("/providers/uitm/icress/")) throw null;

		// @ts-expect-error
		if (globalThis.__DISABLE_BACKEND_INDEX__ === true) throw null;

		const url = new URL(endpoint, process.env.NEXT_PUBLIC_BACKEND_URL);
		let indexPath = url.pathname;

		if (url.search) {
			// turn ?a=1&b=2 into __a_1__b_2
			const querySuffix = url.search
				.slice(1) // remove leading "?"
				.replace(/&/g, "__") // & → __
				.replace(/=/g, "_"); // = → _

			indexPath += `__${querySuffix}`;
		}

		const indexPrefix = process.env.NEXT_PUBLIC_BACKEND_INDEX_URL;

		const res = await fetch(indexPrefix + indexPath.slice(1), {
			...options,
			cache: "no-store",
		});

		if (res.status !== 200) throw null;

		const data = await res.text();

		const lines = data.split("\n");
		const timestampStr = lines[0];
		const actualData = lines.slice(1).join("\n");

		const timestamp = Number(timestampStr);
		const currentTime = Math.floor(Date.now() / 1000);

		if (Math.abs(currentTime - timestamp) > 3600) {
			throw null;
		}

		return new Response(actualData, {
			status: res.status,
			statusText: res.statusText,
			headers: res.headers,
		});
	} catch {
		return fetch(new URL(endpoint, process.env.NEXT_PUBLIC_BACKEND_URL), {
			...options,
			credentials: "include",
		});
	}
}
