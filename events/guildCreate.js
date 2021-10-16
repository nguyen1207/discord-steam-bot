const Guild = require("../models/Guild.js");
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commands = [];
const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

module.exports = {
    name: "guildCreate",

    async execute(guild) {
		console.log("Joined a new guild: " + guild.name);
        const guildId = guild.id;

        guild = await Guild.create({ guildId });

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands }
        );

        console.log("Successfully registered application commands.");
    },
};
