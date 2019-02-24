//
// Configuration for Jest read-write integration tests
//
// I'm separating out read-only tests to be run more frequently because
// reading data is cheaper than writing -- both in StepFunctions and DynamoDB.
// In January 2019 I ran this so much it nearly tapped out my AWS Free Tier
// of StepFunction executions!
//

// import the unit test config; these tests will inherit from it
const config = require("./jest.config.js");

config.testRegex = "readwritetest\\.js$"; // foo.readwritetest.js instead of foo.test.js
config.bail = true; // stop running tests after the first failure

module.exports = config;
