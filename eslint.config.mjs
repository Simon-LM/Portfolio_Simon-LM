/** @format */

// eslint-config-next v16 exports flat config directly — no FlatCompat needed
import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
	// Generated output (compiled package dist, Jest coverage report) —
	// not hand-written code, so not linted. Both are gitignored too.
	{ ignores: ["packages/**/dist/**", "coverage/**"] },
	...nextConfig,
];

export default eslintConfig;
