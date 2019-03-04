// Configuration for Jest unit tests (integration test config inherits from this)
module.exports = {
	// testEnvironment: "node" makes tests run faster by disabling JSDom
	// See https://medium.com/@kevinsimper/how-to-disable-jsdom-in-jest-make-jest-run-twice-as-fast-a01193f23405
	testEnvironment: "node",

	collectCoverage: true,
	collectCoverageFrom: [
		"packages/**/*.{js}",
		"api/lambda_functions/**/*.{js}",
		"state_machine/lambda_functions/**/*.{js}",
		"!**/node_modules/**"
	],

	// Tell where Jest to look for tests
	// I'm not sure if this is necessary: Jest can scan the entire tree
	roots: [
		"packages/",
		"api/lambda_functions/",
		"state_machine/lambda_functions/"
	],

	modulePathIgnorePatterns: ["npm-cache", ".npm", ".cache"],

	transformIgnorePatterns: [
		"<rootDir>/node_modules/(?!http-response-utils|gallery-path-utils)"
	]
};
