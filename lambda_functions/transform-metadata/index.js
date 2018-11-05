const util = require('util');

exports.handler = (event, context, callback) => {
    console.log("Reading input from event:\n", util.inspect(event, {depth: 5}));

    var result = {};
    if (event.Properties) {
        if (event.Properties["exif:DateTimeOriginal"]) {
            result['creationTime'] = event.Properties["exif:DateTimeOriginal"];
        }

        if (event.Properties["exif:ImageDescription"]) {
            result['description'] = event.Properties["exif:ImageDescription"];
        }

        if (event.Properties["exif:GPSLatitude"] && event.Properties["exif:GPSLatitudeRef"] && event.Properties["exif:GPSLongitude"] && event.Properties["exif:GPSLongitudeRef"]) {
            try {
                const lat = parseCoordinate(event.Properties["exif:GPSLatitude"], event.Properties["exif:GPSLatitudeRef"]);
                const long = parseCoordinate(event.Properties["exif:GPSLongitude"], event.Properties["exif:GPSLongitudeRef"]);
                console.log("lat", lat);
                console.log("long", long);
                result.geo = {
                    'latitude': lat, "longitude": long
                };
            } catch (err) {
                // ignore failure in parsing coordinates
                console.log(err);
            }
        }
        if (event.Properties["exif:Make"]) {
            result['exifMake'] = event.Properties["exif:Make"];
        }
        if (event.Properties["exif:Model"]) {
            result['exifModel'] = event.Properties["exif:Model"];
        }
        result['dimensions'] = event["size"];
        result['fileSize'] = event["Filesize"];
        result['format'] = event["format"];
    }
    if (event.Profiles) {
        if (event.Profiles["Profile-iptc"]) {
            if (event.Profiles["Profile-iptc"]["Headline[2,105]"]) {
                result['title'] = event.Profiles["Profile-iptc"]["Headline[2,105]"];
            }
            if (event.Profiles["Profile-iptc"]["Keyword[2,25]"]) {
                result['tags'] = event.Profiles["Profile-iptc"]["Keyword[2,25]"];
            }
        }
    } 
    callback(null, result);
};

/**
 *
 * @param coordinate in the format of "DDD/number, MM/number, SSSS/number" (e.g. "47/1, 44/1, 3598/100")
 * @param coordinateDirection coordinate direction (e.g. "N" "S" "E" "W"
 * @returns {{D: number, M: number, S: number, Direction: string}}
 */
function parseCoordinate(coordinate, coordinateDirection) {

    const degreeArray = coordinate.split(",")[0].trim().split("/");
    const minuteArray = coordinate.split(",")[1].trim().split("/");
    const secondArray = coordinate.split(",")[2].trim().split("/");

    return {
        "D": parseInt(degreeArray[0]) / parseInt(degreeArray[1]),
        "M": parseInt(minuteArray[0]) / parseInt(minuteArray[1]),
        "S": parseInt(secondArray[0]) / parseInt(secondArray[1]),
        "Direction": coordinateDirection
    };
}