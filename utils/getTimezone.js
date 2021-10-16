const zones = require("../data/zones.json");

function getTimezone(cc) {
	const tz =  zones[cc.toUpperCase()];

	return tz ? tz.timezone : null;
}

module.exports = getTimezone;
