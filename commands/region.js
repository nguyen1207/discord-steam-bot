const { SlashCommandBuilder } = require("@discordjs/builders");
const Guild = require("../models/Guild.js");
const getTimezone = require("../utils/getTimezone.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("region")
        .setDescription(
            "Set your region to get appropriate currency. Use /cc command to get a list of country code"
        )
        .addStringOption((option) =>
            option
                .setName("cc")
                .setDescription("Your country code")
                .setRequired(true)
        ),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const cc = interaction.options.getString("cc");
        const timezone = getTimezone(cc);

        if(!timezone) {
            await interaction.reply(`Invalid country code: **${cc}**`);
            return;
        }

        await Guild.findOneAndUpdate({ guildId }, { region: cc });

        await interaction.reply(`You have set your region to **${cc}**`);
    },
};
