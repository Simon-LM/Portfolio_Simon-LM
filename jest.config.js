/** @format */

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
	/* jest config here */
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
};
module.exports = config;
