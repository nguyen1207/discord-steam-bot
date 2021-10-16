const Guild = require("../models/Guild.js");

module.exports = {
    name: "guildDelete",

    async execute(guild) {
		console.log("Left a guild: " + guild.name);
        const guildId = guild.id;

        guild = await Guild.deleteOne({ guildId });
    },
};
