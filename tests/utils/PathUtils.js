/**
 * Static utility functions to help deal with gallery paths
 */
class PathUtils {
	static getYearPath(year) {
		return "/" + year + "/";
	}

	static getWeekPath(year, week) {
		return PathUtils.getYearPath(year) + week + "/";
	}

	static getImagePath(year, week, image) {
		return PathUtils.getWeekPath(year, week) + image;
	}

	static assertIsAlbumPath(albumPath) {
		if (!albumPath || !albumPath.match(PathUtils.getAlbumPathRegex())) {
			throw "The string '" + albumPath + "' is not a valid album path.";
		}
	}

	static getAlbumPathRegex() {
		return /^\/\d\d\d\d\/(\d\d-\d\d\/)?$/;
	}

	static getYearAlbumPathRegex() {
		return /^\/\d\d\d\d\/$/;
	}

	static getWeekAlbumPathRegex() {
		return /^\/\d\d\d\d\/\d\d-\d\d\/$/;
	}

	static getImagePathRegex() {
		return /^\/\d\d\d\d\/\d\d-\d\d\/.*\..*$/;
	}
}
module.exports = PathUtils;
