/**
 * Return the parent path from the given path.  For example:
 *  - If the path is an image, it returns the album the image is in.
 *  - If the path is an album, it returns the parent album the child is in.
 *  - If the path is an album off the root like "2000", it returns '/'
 *  - If the path is the root album (the gallery itself), it return ''.
 */
function getParentFromPath(path) {
	if (!path) throw new Error("Path cannot be empty");
	path = path.toString().trim();
	if (!path) throw new Error("Path cannot be empty");
	if (path === "/") return "";
	// get the album's path from the photo's path
	let pathParts = path.split("/");
	if (!pathParts[pathParts.length - 1]) pathParts.pop(); // if the path ended in a "/", remove the blank path part at the end
	pathParts.pop(); // remove leaf of path
	path = pathParts.join("/");
	if (path.lastIndexOf("/", 0) !== 0) path = "/" + path; // make sure path starts with a "/"
	return path;
}

module.exports = getParentFromPath;
