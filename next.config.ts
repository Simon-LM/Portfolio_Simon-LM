/** @format */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: "/",
				destination: "/en",
				permanent: true,
			},
		];
	},
};

export default nextConfig;
