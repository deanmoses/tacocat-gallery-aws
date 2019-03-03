/**
 * Static utility functions to help deal with gallery paths
 */
class PathUtils {
	/**
	 * For the given path, return 1) the leaf item and 2) the parent path
	 *
	 * For example:
	 *  - /2001/12-31/image.jpg returns  '/2001/12-31/' and 'image.jpg'
	 *  - /2001/12-31 returns '/2001/' and '12-31'
	 *  - /2001 returns '/' and 2000'
	 *  - / returns  ''
	 */
	static getParentAndNameFromPath(path) {
		if (!path) throw new Error("Path cannot be empty");
		path = path.toString().trim();
		if (!path) throw new Error("Path cannot be empty");
		if (path === "/") return { parent: "", name: "" };
		let pathParts = path.split("/"); // split the path apart
		if (!pathParts[pathParts.length - 1]) pathParts.pop(); // if the path ended in a "/", remove the blank path part at the end
		const name = pathParts.pop(); // remove leaf of path
		path = pathParts.join("/");
		if (path.substr(-1) !== "/") path = path + "/"; // make sure path ends with a "/"
		if (path.lastIndexOf("/", 0) !== 0) path = "/" + path; // make sure path starts with a "/"
		return {
			parent: path,
			name: name
		};
	}

	static getYearPath(year) {
		return "/" + year;
	}

	static getWeekPath(year, week) {
		return PathUtils.getYearPath(year) + "/" + week;
	}

	static getImagePath(year, week, image) {
		return PathUtils.getWeekPath(year, week) + "/" + image;
	}

	static assertIsAlbumPath(albumPath) {
		if (!albumPath || !albumPath.match(PathUtils.getAlbumPathRegex())) {
			throw "'" + albumPath + "' is not a valid album path.";
		}
	}

	static assertIsImagePath(imagePath) {
		if (!imagePath || !imagePath.match(PathUtils.getImagePathRegex())) {
			throw "'" + imagePath + "' is not a valid image path.";
		}
	}

	/**
	 * Root, year or album path like / or /2001/ or /2001/12-31/
	 */
	static getAlbumPathRegex() {
		//return /^\/(\d\d\d\d\/(\d\d-\d\d\/)?)?$/;
		return new RegExp(PathUtils.getAlbumPathRegexString());
	}

	static getAlbumPathRegexString() {
		return "^/(\\d\\d\\d\\d(/\\d\\d-\\d\\d)?/?)?$";
	}

	/**
	 * Root album is the empty string
	 */
	static getRootAlbumNameRegex() {
		//return /^$/;
		return new RegExp(PathUtils.getRootAlbumNameRegexString());
	}

	static getRootAlbumNameRegexString() {
		return "^$";
	}

	/**
	 * Root album path is /
	 */
	static getRootAlbumPathRegex() {
		//return /^\/$/;
		return new RegExp(PathUtils.getRootAlbumPathRegexString());
	}

	static getRootAlbumPathRegexString() {
		return "^/$";
	}

	/**
	 * Year album name like 2001
	 */
	static getYearAlbumNameRegex() {
		//return /^\d\d\d\d$/;
		return new RegExp(PathUtils.getYearAlbumNameRegexString());
	}

	static getYearAlbumNameRegexString() {
		return "^\\d\\d\\d\\d$";
	}

	/**
	 * Year album path like /2001/
	 */
	static getYearAlbumPathRegex() {
		//return /^\/\d\d\d\d\/$/;
		return new RegExp(PathUtils.getYearAlbumPathRegexString());
	}

	static getYearAlbumPathRegexString() {
		return "^/\\d\\d\\d\\d/?$";
	}

	/**
	 * Week album name like 12-31
	 */
	static getWeekAlbumNameRegex() {
		//return /^\d\d-\d\d$/;
		return new RegExp(PathUtils.getWeekAlbumNameRegexString());
	}

	static getWeekAlbumNameRegexString() {
		return "^\\d\\d-\\d\\d$";
	}

	/**
	 * Week album path like /2001/12-31/
	 */
	static getWeekAlbumPathRegex() {
		//return /^\/\d\d\d\d\/\d\d-\d\d\/$/;
		return new RegExp(PathUtils.getWeekAlbumPathRegexString());
	}

	static getWeekAlbumPathRegexString() {
		return "^/\\d\\d\\d\\d/\\d\\d-\\d\\d/?$";
	}

	/**
	 * Image name like image.jpg
	 */
	static getImageNameRegex() {
		//return /^.*\.[jpg|gif|heic|png]$/;
		return new RegExp(PathUtils.getImageNameRegexString());
	}

	static getImageNameRegexString() {
		return "^.*\\.(jpg|gif|heic|png)$";
	}

	/**
	 * Image path like /2001/12-31/image.jpg
	 */
	static getImagePathRegex() {
		//return /^\/\d\d\d\d\/\d\d-\d\d\/.*\.[jpg|gif|heic|png]$/;
		return new RegExp(PathUtils.getImagePathRegexString());
	}

	static getImagePathRegexString() {
		return "^/\\d\\d\\d\\d/\\d\\d-\\d\\d/.*\\.(jpg|gif|heic|png)$";
	}

	/**
	 * ISO 8601 date string like "2001-12-31T23:59:59.999Z"
	 */
	static getDateRegex() {
		//return /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ/;
		return new RegExp(PathUtils.getDateRegexString());
	}
	static getDateRegexString() {
		return "^\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d.\\d\\d\\dZ$";
	}
}
module.exports = PathUtils;
