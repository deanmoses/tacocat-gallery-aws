//
// Configuration for *UPDATE* integration Jest tests
//
// I'm separating out different types of integration tests that can be run independently:
// 1) READ ONLY tests that require the existence of fixture data to already be there
// 2) UPDATE tests that require the existence of fixture data to already be there
// 3) FULL READ WRITE tests that create all their data, then delete it
//
// Why?
// Because reading data is cheaper than writing in StepFunctions and DynamoDB.
// In January 2019 I ran this so much it nearly tapped out my AWS Free Tier of
// StepFunction executions!
//

// import the unit test config; these tests will inherit from it
const config = require("./jest.config.base.js");

// foo.updatetest.js instead of foo.test.js
config.testRegex = "updatetest\\.js$";

// Tell where Jest to look for tests
// I'm not sure if this is necessary: Jest can scan the entire tree
config.roots = ["tests/"];

module.exports = config;
