/**
 * For the given path, return the parent path and the leaf item name like this { parent: '', name: ''}
 *
 * For example:
 *  - /2001/12-31/image.jpg returns  {parent: '/2001/12-31/', name: 'image.jpg'}
 *  - /2001/12-31 returns {parent: '/2001/', name: '12-31'}
 *  - /2001 returns {parent: '/', name: 2000'}
 *  - / returns  {parent: '', name: ''}
 */
function getParentAndNameFromPath(path) {
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

module.exports = getParentAndNameFromPath;
