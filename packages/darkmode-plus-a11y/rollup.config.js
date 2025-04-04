/** @format */

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import url from "@rollup/plugin-url";

const packageJson = require("./package.json");

export default {
	input: "src/index.ts",
	output: [
		{
			file: packageJson.main,
			format: "cjs",
			sourcemap: true,
		},
		{
			file: packageJson.module,
			format: "esm",
			sourcemap: true,
		},
	],
	plugins: [
		peerDepsExternal(),
		resolve(),
		commonjs(),
		typescript({ tsconfig: "./tsconfig.json" }),
		url({
			include: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.webp", "**/*.avif"],
			limit: 0, // Copier tous les fichiers
			fileName: "[dirname][name][extname]",
		}),
		terser(),
	],
	external: ["react", "react-dom", "next/image"],
};
