const Guild = require("../models/Guild.js");
const sendSpecialGamesDaily = require("../utils/SendSpecialGamesDaily.js");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity("/help", { type: "PLAYING" });

        const guildIds = client.guilds.cache.map(guild => guild.id);

        for(const guildId of guildIds) {
            let guild = await Guild.findOne({guildId});

            if(guild) {
                const channelId = guild.channelId;
                const minute = guild.sentMinute;
                const hour = guild.sentHour;
    
                if(minute && hour && channelId) {
                    const time = `${minute} ${hour} * * *`;
    
                    await sendSpecialGamesDaily(client, time, channelId, guildId);
                }
    
                console.log(minute, hour, channelId);
            }
            else {
                guild = await Guild.create({guildId});
            }

            client.cc = guild.region;
            console.log(guild)
        }
    },
};
