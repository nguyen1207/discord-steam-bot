const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

const Guild = require("../models/Guild");
const formatTime = require("../utils/formatTime.js");
const formatPrice = require("../utils/formatPrice.js");

async function fetchSaleGames(cc) {
    const res = await fetch(
        `https://store.steampowered.com/api/featuredcategories?cc=${cc}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const data = await res.json();

    const specials = data.specials.items;
    const topSeller = data.top_sellers.items;

    return [...specials, ...topSeller];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sale")
        .setDescription("Get list of games on sale"),

    async execute(interaction) {
        await interaction.deferReply();

        const guildId = interaction.guildId;
        const guild = await Guild.findOne({ guildId });
        const cc = guild.region;

        const sales = await fetchSaleGames(cc);

        const messages = new Set();

        sales.forEach((game) => {
            if (game.discount_percent) {
                messages.add(
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

        await interaction.editReply([...messages].join("\n"));
    },
};
