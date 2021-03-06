// Require the necessary discord.js classes
require("dotenv").config();
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const db = require("./connections/db.js");

(async () => {
    try {
        db.connect();

        // Create a new client instance
        const client = new Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGES,
            ],
        });

        client.commands = new Collection();

        // Reading command files 
        const commandFiles = fs
            .readdirSync("./commands")
            .filter((file) => file.endsWith(".js"));

        // Dynamically executing commands
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            // Set a new item in the Collection
            // With the key as the command name and the value as the exported module
            client.commands.set(command.data.name, command);
        }


        // Reading event files
        const eventFiles = fs
            .readdirSync("./events")
            .filter((file) => file.endsWith(".js"));

        for (const file of eventFiles) {
            const event = require(`./events/${file}`);
            
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }

        // Login to Discord with your client's token
        client.login(process.env.TOKEN);

    }
    catch(err) {
        console.error(err);
        process.exit(1);
    }
})();

