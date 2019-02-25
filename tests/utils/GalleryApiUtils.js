/**
 * Static class with static functions to help with working with results from the Gallery API
 */
class GalleryApiUtils {
	/**
	 * Find image in array of images and albums
	 *
	 * @param {Array} children array of an album's child images as returned from API
	 * @param {*} imageName like "image.jpg"
	 * @returns the named image in the array of children, or undefined if not found
	 */
	static findImage(children, imageName) {
		return GalleryApiUtils.findChild(children, imageName);
	}

	/**
	 * Find child album in array of images and albums
	 *
	 * @param {Array} children array of an album's child images as returned from API
	 * @param {*} imageName like "image.jpg"
	 * @returns the named image in the array of children, or undefined if not found
	 */
	static findAlbum(children, imageName) {
		return GalleryApiUtils.findChild(children, imageName);
	}

	/**
	 * Find child in array of images and albums
	 *
	 * @param {Array} children array of an album's child images as returned from API
	 * @param {*} childName like "image.jpg"
	 * @returns the named image in the array of children, or undefined if not found
	 */
	static findChild(children, childName) {
		return children.find(child => {
			return child.itemName === childName;
		});
	}
}
module.exports = GalleryApiUtils;
