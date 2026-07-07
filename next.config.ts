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
	// Résolution des @use "a11y-prefs/scss/…" (paquet du workspace pnpm,
	// symlinké dans node_modules) — Dart Sass ne résout pas les modules
	// Node par défaut. Chantier E3, docs/theme-system/PLAN-extraction-monorepo.md.
	sassOptions: {
		includePaths: ["node_modules"],
	},
	// Le paquet du workspace est consommé en source TypeScript (le dist
	// publiable est un sujet E7) — Next doit le transpiler. Chantier E4.
	transpilePackages: ["a11y-prefs"],
	// Dev-server only: without this, Next.js rejects the HMR WebSocket handshake
	// when the dev server is reached via a LAN IP instead of localhost, which
	// leaves useSyncExternalStore-based "mounted" hooks stuck at false (skeleton
	// UI never resolves). No effect on `next build` / production.
	allowedDevOrigins: ["192.168.0.174"],
	images: {
		// Migrated from deprecated `domains` to `remotePatterns`
		remotePatterns: [
			{
				protocol: "https",
				hostname: "vercel.com",
			},
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

	// // // // // // //

	async headers() {
		return [
			{
				source: "/:lang",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=3600, stale-while-revalidate=86400",
					},
				],
			},
			{
				source: "/:lang/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=3600, stale-while-revalidate=86400",
					},
				],
			},
			{
				source: "/icons/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},

	// // // // // // // // // //
};

export default nextConfig;
