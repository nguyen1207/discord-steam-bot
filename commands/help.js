const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show all commands"),

    async execute(interaction) {
        const commands = interaction.client.commands;
		const messages = ["**Commands list**\n"];

		commands.forEach(commandObj=> {
			const command = commandObj.data;
			let options = command.options;
			let optionNames = [];
			
			options.forEach(option => {
				optionNames.push(option.name);
			})
			
			messages.push(`/${command.name} ${command.options.length ? "<" + optionNames.join("> <") + ">" : ""} :  ${command.description}`)
		})
		
		await interaction.reply(messages.join("\n"));
    },
};
