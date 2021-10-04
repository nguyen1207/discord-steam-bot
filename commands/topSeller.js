const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

const formatTime = require("../utils/formatTime.js");
const formatPrice = require("../utils/formatPrice.js");

async function fetchBestSellingGames() {
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

    return data.top_sellers.items;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ts")
        .setDescription("Get list of best-selling games"),

    async execute(interaction) {
        await interaction.deferReply();

        const topSellers = await fetchBestSellingGames();
        console.log(topSellers);

        const messages = [];

        topSellers.forEach((game) => {
            if (game.discount_percent) {
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
            } else {
                messages.push(
                    `${game.name}   |	**${formatPrice(
                        game.final_price,
                        game.currency
                    )}**`
                );
            }
        });

        await interaction.editReply(messages.join("\n"));
    },
};
