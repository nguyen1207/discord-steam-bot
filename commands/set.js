const { SlashCommandBuilder } = require("@discordjs/builders");
var CronJob = require("cron").CronJob;
const fetch = require("node-fetch");

const formatTime = require("../utils/formatTime.js");
const formatPrice = require("../utils/formatPrice.js");

async function fetchSpecialGames() {
    const res = await fetch(
        "https://store.steampowered.com/api/featuredcategories",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const data = await res.json();

    const dailyDeal = data["4"];
    const specials = data.specials.items;
    const result = [];

    result.push(dailyDeal);
    result.push(...specials);

    return result;
}

async function sendSpecialGamesDaily(client, time, channelId) {
    const channel = await client.channels.fetch(channelId);
    const minute = time.split(" ")[0];
    const hour = time.split(" ")[1];

    const job = new CronJob(
        time,
        async function () {
            const specials = await fetchSpecialGames();

            const messages = [`**Specials today** Updated daily at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}\n`];

            specials.forEach((game) => {
                if (game.id === "cat_dailydeal") {
                    game = game.items[0];
                    messages.push(
                        `**Daily deal**: ${game.name}   |  **-${
                            game.discount_percent
                        }%** ~~${formatPrice(
                            game.original_price,
                            game.currency
                        )}~~ **${formatPrice(
                            game.final_price,
                            game.currency
                        )}** `
                    );
                } else {
                    messages.push(
                        `${game.name}   |    **-${
                            game.discount_percent
                        }%** ~~${formatPrice(
                            game.original_price,
                            game.currency
                        )}~~ **${formatPrice(
                            game.final_price,
                            game.currency
                        )}**    |   ends: ${formatTime(
                            game.discount_expiration * 1000
                        )}`
                    );
                }
            });

            channel.send(messages.join("\n"));
        },
        null,
        true,
        "Asia/Saigon"
    );
    
    client.cronJob = job;
    client.cronJobChannelId = channelId;

    job.start();
}

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
        const client = interaction.client;
        const channelName = interaction.options.getString("channel-name");
        const hour = parseInt(interaction.options.getString("hour"));
        const minute = parseInt(interaction.options.getString("minute"));
        
        if(isNaN(hour) || isNaN(minute) || (hour > 23 || hour < 0) || (minute > 59 || minute < 0)) {
            await interaction.reply("**INVALID TIME**\n\nHour: from 0 to 23\nMinute: from 0 to 59");
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

        await sendSpecialGamesDaily(client, time, channelId);

        await interaction.reply(
            `You have set Channel **${channelName}** to get daily game deals at **${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}**`
        );
    },
};
