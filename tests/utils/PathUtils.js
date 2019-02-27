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
			throw "'" + albumPath + "' is not a valid album path.";
		}
	}

	static assertIsImagePath(imagePath) {
		if (!imagePath || !imagePath.match(PathUtils.getImagePathRegex())) {
			throw "'" + imagePath + "' is not a valid image path.";
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
