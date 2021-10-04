const { SlashCommandBuilder } = require("@discordjs/builders");

function getChannelName(channelId, client) {
	const channels = client.channels.cache;

    const channelName = channels.find((channel) => channel.id === channelId);

    return channelName;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Show selected channel and time to receive daily game deals"),

    async execute(interaction) {
        const client = interaction.client;

		if(!client.cronJob) {
			const message = `You have not select time and channel to receive daily game deals. Use **/set** command to set up`;

			await interaction.reply(message);
			return;
		}
		
		const time = client.cronJob.cronTime.source;
		const minute = time.split(" ")[0];
		const hour = time.split(" ")[1];
		const channelName = getChannelName(client.cronJobChannelId, client);

		const message = `Get game deals everyday in Channel **${channelName}** at **${hour.padStart(2, "0")}:${minute.padStart(2, "0")}**`
		await interaction.reply(message);
    },
};
