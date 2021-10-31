const { SlashCommandBuilder } = require("@discordjs/builders");

const Guild = require("../models/Guild.js");

function getChannelName(channelId, client) {
    const channels = client.channels.cache;

    const channelName = channels.find((channel) => channel.id === channelId);

    return channelName;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription(
            "Show selected channel and time to receive daily game deals"
        ),

    async execute(interaction) {
        const client = interaction.client;

        const guildId = interaction.guildId;
        const guild = await Guild.findOne({ guildId });
        const { channelId } = guild;
        
        const time = client[guildId]?.cronTime.source;
        const minute = time?.split(" ")[0];
        const hour = time?.split(" ")[1];
        console.log(minute, hour);
		
        if (
            minute === undefined &&
            hour === undefined &&
            !channelId
        ) {
            const message = `You have not select time and channel to receive daily game deals. Use **/set** command to set up`;

            await interaction.reply(message);
            return;
        }

        const channelName = getChannelName(channelId, client);

        const message = `Get game deals everyday in Channel **${channelName}** at **${hour.padStart(
            2,
            "0"
        )}:${minute.padStart(2, "0")}**`;
        await interaction.reply(message);
    },
};
