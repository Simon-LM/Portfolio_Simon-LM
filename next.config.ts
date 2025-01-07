/** @format */

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
// 	reactStrictMode: true,
// 	// output: "export",
// 	// basePath: "/Portfolio_Simon-LM",
// 	images: {
// 		// unoptimized: true,
// 		domains: ["vercel.com"],
// 	},
// 	trailingSlash: true,

// 	async redirects() {
// 		return [
// 			{
// 				source: "/",
// 				destination: "/en",
// 				permanent: true,
// 			},
// 			{
// 				source: "/privacy-policy",
// 				destination: "/en/privacy-policy",
// 				permanent: true,
// 			},
// 		];
// 	},
// };

// export default nextConfig;

// // // // // // // // // // // // // //

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
// 	reactStrictMode: true,
// 	images: {
// 		domains: ["vercel.com"],
// 	},
// 	// i18n: {
// 	// 	locales: ["en", "fr"],
// 	// 	defaultLocale: "en",
// 	// },
// 	async redirects() {
// 		return [
// 			{
// 				source: "/",
// 				destination: "/en",
// 				permanent: true,
// 			},
// 			// {
// 			// 	source: "/privacy-policy",
// 			// 	destination: "/en/privacy-policy",
// 			// 	permanent: true,
// 			// },
// 		];
// 	},
// };

// export default nextConfig;

// // // // // // // // // // // // // // // // //

// import type { NextConfig } from "next/types";

// const nextConfig: NextConfig = {
// 	reactStrictMode: true,
// 	images: {
// 		domains: ["vercel.com"],
// 		remotePatterns: [
// 			{
// 				protocol: "https",
// 				hostname: "**.vercel.app",
// 			},
// 		],
// 	},
// 	async redirects() {
// 		return [
// 			{
// 				source: "/",
// 				destination: "/en",
// 				permanent: true,
// 			},
// 		];
// 	},
// };

// export default nextConfig;

// // // // // // // // // // // // // // //

// import type { NextConfig } from "next/types";

// const nextConfig: NextConfig = {
// 	reactStrictMode: true,
// 	images: {
// 		domains: ["vercel.com"],
// 		remotePatterns: [
// 			{
// 				protocol: "https",
// 				hostname: "**.vercel.app",
// 			},
// 		],
// 	},
// 	i18n: {
// 		locales: ["en", "fr"],
// 		defaultLocale: "en",
// 	},
// 	async redirects() {
// 		return [
// 			{
// 				source: "/",
// 				destination: "/en",
// 				permanent: true,
// 			},
// 		];
// 	},
// };

// export default nextConfig;

// // // // // // // // // // // // // // // // // //

import type { NextConfig } from "next/types";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		domains: ["vercel.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.vercel.app",
			},
		],
	},
	// i18n: {
	// 	locales: ["en", "fr"],
	// 	defaultLocale: "en",
	// },
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
