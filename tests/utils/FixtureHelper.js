const PathUtils = require("./PathUtils.js");

/**
 * Helper to deal with fixture data
 */
class FixtureHelper {
	/**
	 * @param {Object} fixture something like {apiUrl: "", ...}
	 */
	constructor(fixture) {
		this.fixture = fixture;
	}

	/**
	 * Current year
	 */
	getYear() {
		return this.fixture.current.year;
	}

	/**
	 * Current week
	 */
	getWeek() {
		return this.fixture.current.week;
	}

	/**
	 * Current image
	 */
	getImage() {
		return this.fixture.current.image;
	}

	/**
	 * Alias to getCurrentYearPath()
	 */
	getYearPath() {
		return this.getCurrentYearPath();
	}

	/**
	 * Current week of current year
	 */
	getWeekPath() {
		const f = this.fixture.current;
		return PathUtils.getWeekPath(f.year, f.week);
	}

	/**
	 * Current image of current week of current year
	 */
	getImagePath() {
		const f = this.fixture.current;
		return PathUtils.getImagePath(f.year, f.week, f.week);
	}

	getCurrentYearPath() {
		return PathUtils.getYearPath(this.fixture.current.year);
	}

	getNextYearPath() {
		return PathUtils.getYearPath(this.fixture.next.year);
	}

	getPrevYearPath() {
		return PathUtils.getYearPath(this.fixture.prev.year);
	}
}
module.exports = FixtureHelper;
