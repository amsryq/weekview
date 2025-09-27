import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	reactStrictMode: true,
	allowedDevOrigins: ["localhost.weekview.my"],
};

export default nextConfig;
