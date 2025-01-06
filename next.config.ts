/** @format */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	output: "export",
	basePath: "/Portfolio_Simon-LM",
	images: {
		unoptimized: true,
	},
	trailingSlash: true,
	// async redirects() {
	// 	return [
	// 		{
	// 			source: "/",
	// 			destination: "/en",
	// 			permanent: true,
	// 		},
	// 		{
	// 			source: "/privacy-policy",
	// 			destination: "/en/privacy-policy",
	// 			permanent: true,
	// 		},
	// 	];
	// },
};

export default nextConfig;
