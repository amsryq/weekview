import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	reactStrictMode: true,
	allowedDevOrigins: [
		"staging.weekview.my"
	],
};

export default nextConfig;
