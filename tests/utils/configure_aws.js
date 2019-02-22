//
// Return a configured version of the AWS Javascript SDK object,
// supplied with the test user's credentials.
//

const AWS = require("aws-sdk");
const credentials = new AWS.SharedIniFileCredentials({
	profile: "gallery-automated-test"
});
AWS.config.credentials = credentials;
AWS.config.update({ region: "us-west-2" });

module.exports = AWS;
