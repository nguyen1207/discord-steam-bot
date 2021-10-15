const { SlashCommandBuilder } = require("@discordjs/builders");
const contries = require("../data/countries.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cc")
        .setDescription("Display country codes"),

    async execute(interaction) {
        const messages = [];

        contries.forEach((country) => {
            messages.push(
                `${country.country}: ${country.cc}`
            );
        });

        messages.push("\n\nIf you cannot find your country code in the list, that means Steam **does not support** your country currency at the moment. The default currency will be **US dollars**.")

        await interaction.reply(messages.join("\n"));
    },
};
