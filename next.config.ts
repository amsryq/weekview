import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	reactStrictMode: true,
	allowedDevOrigins: ["localhost.weekview.my"],
	env: {
		COPYRIGHT_YEAR: String(new Date().getFullYear()),
	},
};

export default nextConfig;
