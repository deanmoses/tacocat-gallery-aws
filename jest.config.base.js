// Base configuration for Jest unit tests
// Unit and integration tests inherit from this and apply more configuration
module.exports = {
	// testEnvironment: "node" makes tests run faster by disabling JSDom
	// See https://medium.com/@kevinsimper/how-to-disable-jsdom-in-jest-make-jest-run-twice-as-fast-a01193f23405
	testEnvironment: "node",

	modulePathIgnorePatterns: ["npm-cache", ".npm", ".cache"],

	transformIgnorePatterns: [
		"<rootDir>/node_modules/(?!http-response-utils|gallery-path-utils)"
	]
};
