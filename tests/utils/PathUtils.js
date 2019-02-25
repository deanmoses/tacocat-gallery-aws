/**
 * Static utility functions to help deal with gallery paths
 */
class PathUtils {
	static getYearPath(year) {
		return year + "/";
	}

	static getWeekPath(year, week) {
		return this.getYearPath(year) + week + "/";
	}

	static getImagePath(year, week, image) {
		return this.getWeekPath(year, week) + image;
	}
}
module.exports = PathUtils;
