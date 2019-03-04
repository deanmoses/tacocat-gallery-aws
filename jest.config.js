// Configuration for Jest *UNIT* tests
// Integration tests get a different configuration

// import the base test config; these tests will inherit from it
const config = require("./jest.config.base.js");

config.collectCoverage = true;
config.collectCoverageFrom = [
	"packages/**/*.{js}",
	"api/lambda_functions/**/*.{js}",
	"state_machine/lambda_functions/**/*.{js}",
	"!**/node_modules/**"
];

config.roots = [
	"packages/",
	"api/lambda_functions/",
	"state_machine/lambda_functions/"
];

module.exports = config;
