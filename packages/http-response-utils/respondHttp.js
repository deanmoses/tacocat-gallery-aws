function respondHttp(body, statusCode = 200) {
	return {
		isBase64Encoded: false,
		statusCode: statusCode,
		body: JSON.stringify(body)
	};
}
module.exports = respondHttp;
