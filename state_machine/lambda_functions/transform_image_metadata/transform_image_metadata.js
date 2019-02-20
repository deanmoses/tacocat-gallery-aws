/**
 *
 * @param {*} original Original metadata, extracted via gm GraphicksMagick
 * @returns transformed metadata
 */
function transformImageMetadata(original) {
	if (!original) throw "No input";

	var result = {};
	if (original.Properties) {
		if (original.Properties["exif:DateTimeOriginal"]) {
			result["creationTime"] = parseExifDate(
				original.Properties["exif:DateTimeOriginal"]
			);
		}

		if (original.Properties["exif:ImageDescription"]) {
			result["description"] = original.Properties["exif:ImageDescription"];
		}

		if (
			original.Properties["exif:GPSLatitude"] &&
			original.Properties["exif:GPSLatitudeRef"] &&
			original.Properties["exif:GPSLongitude"] &&
			original.Properties["exif:GPSLongitudeRef"]
		) {
			try {
				const lat = parseCoordinate(
					original.Properties["exif:GPSLatitude"],
					original.Properties["exif:GPSLatitudeRef"]
				);
				const long = parseCoordinate(
					original.Properties["exif:GPSLongitude"],
					original.Properties["exif:GPSLongitudeRef"]
				);
				result.geo = {
					latitude: lat,
					longitude: long
				};
			} catch (err) {
				// ignore failure in parsing coordinates
				console.log(err);
			}
		}
		if (original.Properties["exif:Make"]) {
			result["exifMake"] = original.Properties["exif:Make"];
		}
		if (original.Properties["exif:Model"]) {
			result["exifModel"] = original.Properties["exif:Model"];
		}
		result["dimensions"] = original["size"];
		result["fileSize"] = original["Filesize"];
		result["format"] = original["format"];
	}
	if (original.Profiles) {
		if (original.Profiles["Profile-iptc"]) {
			if (original.Profiles["Profile-iptc"]["Headline[2,105]"]) {
				result["title"] = original.Profiles["Profile-iptc"]["Headline[2,105]"];
			}
			if (original.Profiles["Profile-iptc"]["Keyword[2,25]"]) {
				result["tags"] = original.Profiles["Profile-iptc"]["Keyword[2,25]"];
			}
		}
	}
	return result;
}

module.exports = transformImageMetadata;

/**
 *
 * @param coordinate in the format of "DDD/number, MM/number, SSSS/number" (e.g. "47/1, 44/1, 3598/100")
 * @param coordinateDirection coordinate direction (e.g. "N" "S" "E" "W"
 * @returns {{D: number, M: number, S: number, Direction: string}}
 */
function parseCoordinate(coordinate, coordinateDirection) {
	const degreeArray = coordinate
		.split(",")[0]
		.trim()
		.split("/");
	const minuteArray = coordinate
		.split(",")[1]
		.trim()
		.split("/");
	const secondArray = coordinate
		.split(",")[2]
		.trim()
		.split("/");

	return {
		D: parseInt(degreeArray[0]) / parseInt(degreeArray[1]),
		M: parseInt(minuteArray[0]) / parseInt(minuteArray[1]),
		S: parseInt(secondArray[0]) / parseInt(secondArray[1]),
		Direction: coordinateDirection
	};
}

/**
 * @param {*} dateString of the format "YYYY:MM:DD HH:MM:SS"
 * @returns seconds since epoch
 */
function parseExifDate(dateString) {
	var b = dateString.split(/\D/); // Split on non-digit characters
	return new Date(b[0], b[1] - 1, b[2], b[3], b[4], b[5]).getTime() / 1000;
}
