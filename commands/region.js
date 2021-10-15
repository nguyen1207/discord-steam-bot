const { SlashCommandBuilder } = require("@discordjs/builders");
const Guild = require("../models/Guild.js");

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

        await Guild.findOneAndUpdate({ guildId }, { region: cc });

        await interaction.reply(`You have set your region to **${cc}**`);
    },
};
