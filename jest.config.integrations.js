// Configuration for Jest integration tests

// import the unit test config; integration tests will inherit from it
const config = require("./jest.config.js");

config.testRegex = "integration\\.js$"; // foo.integration.js instead of foo.test.js
config.bail = true; // stop running tests after the first failure

module.exports = config;
