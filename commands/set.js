const { SlashCommandBuilder } = require("@discordjs/builders");

const Guild = require("../models/Guild.js");
const sendSpecialGamesDaily = require("../utils/sendSpecialGamesDaily.js");

function findChannelId(client, channelName) {
    const channels = client.channels.cache;

    const channel = channels.find((channel) => channel.name === channelName);

    return channel ? channel.id : null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set")
        .setDescription("Select channel and time to get daily game deals")
        .addStringOption((option) =>
            option
                .setName("channel-name")
                .setDescription("Channel name")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("hour")
                .setDescription("Get daily game deals at selected hour")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("minute")
                .setDescription("Get daily game deals at selected minute")
                .setRequired(true)
        ),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const client = interaction.client;
        const channelName = interaction.options.getString("channel-name");
        const hour = parseInt(interaction.options.getString("hour"));
        const minute = parseInt(interaction.options.getString("minute"));

        if (
            isNaN(hour) ||
            isNaN(minute) ||
            hour > 23 ||
            hour < 0 ||
            minute > 59 ||
            minute < 0
        ) {
            await interaction.reply(
                "**INVALID TIME**\n\nHour: from 0 to 23\nMinute: from 0 to 59"
            );
            return;
        }

        const time = `${minute} ${hour} * * *`;
        const channelId = findChannelId(client, channelName);

        if (!channelId) {
            await interaction.reply("Not found channel");
            return;
        }

        // If user modify time
        if (client.cronJob) {
            client.cronJob.stop();
        }

        await sendSpecialGamesDaily(client, time, channelId, guildId);

        await Guild.findOneAndUpdate(
            { guildId },
            { channelId, sentMinute: minute, sentHour: hour }
        );

        await interaction.reply(
            `You have set Channel **${channelName}** to get daily game deals at **${hour
                .toString()
                .padStart(2, "0")}:${minute.toString().padStart(2, "0")}**`
        );
    },
};
