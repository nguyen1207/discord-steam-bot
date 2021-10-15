const mongoose = require('mongoose');
const { Schema } = mongoose;

const GuildSchema = new Schema({
	guildId: {
		type: String,
	},
	channelId: { 
		type: String,
		default: null,
	},
	sentMinute: {
		type: Number,
		default: null,
	},
	sentHour: {
		type: Number,
		default: null,
	},
	region: {
		type: String,
		default: "us"
	}
})

module.exports = mongoose.model('Guild', GuildSchema);