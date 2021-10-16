const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");
const getDistance = require("../utils/editDistance.js");
const Guild = require("../models/Guild.js");

async function fetchGameList() {
    const gameListUrl =
        "https://api.steampowered.com/ISteamApps/GetAppList/v2/";
    const res = await fetch(gameListUrl);
    const data = await res.json();

    return data.applist.apps;
}

function getMatchedGame(gameList, title) {
    const regex = new RegExp("^" + title.split(" ").join("|"), "gi");
    const matchedGames = gameList.filter((game) => {
        if (game.name.match(regex)) {
            //Add distance to sort for best match
            game.distance = getDistance(title, game.name);

            return true;
        }

        return false;
    });

    return matchedGames;
}

async function fetchGamesPrice(gameIds, cc) {
    const gameIdsParameter = gameIds.join(",");

    const gamesPriceOverviewUrl = `https://store.steampowered.com/api/appdetails?appids=${gameIdsParameter}&filters=price_overview&cc=${cc}`;
    const res = await fetch(gamesPriceOverviewUrl);

    const gamesPriceData = await res.json();

    return gamesPriceData;
}

async function fetchGameDetails(gameId, cc) {
    const gameDetailsUrl = `https://store.steampowered.com/api/appdetails?appids=${gameId}&cc=${cc}`;
    const res = await fetch(gameDetailsUrl);

    const data = await res.json();
    return data[gameId];
}

function formatMessage(game) {
    let message = "";

    if (game.discountPercent) {
        message = `${game.name}  |    **-${game.discountPercent}%** ~~${game.initialPrice}~~ **${game.finalPrice}**`;
    } else {
        message = `${game.name}  |   **${game.finalPrice}**`;
    }

    return message;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("get")
        .setDescription("Get game info from Steam")
        .addStringOption((option) => {
            return option
                .setName("title")
                .setDescription("Game title")
                .setRequired(true);
        }),

    async execute(interaction) {
        await interaction.deferReply();

        const guildId = interaction.guildId;
        const guild = await Guild.findOne({ guildId });
        const cc = guild.region;

        // Get game title and remove extra spaces
        const title = interaction.options
            .getString("title")
            .trim()
            .replace(/\s+/g, " ");

        const gameList = await fetchGameList();

        const matchedGames = getMatchedGame(gameList, title);

        // Sort best matched game
        matchedGames.sort(
            (firstGame, secondGame) => firstGame.distance - secondGame.distance
        );

        if (matchedGames.length == 0) {
            return await interaction.editReply("I cannot get that");
        }

        // Can be less than 20
        const top20MatchedGames = matchedGames.slice(0, 20);

        const gameIds = [];
        for (const game of top20MatchedGames) {
            gameIds.push(game.appid);
        }

        const gamesPriceData = await fetchGamesPrice(gameIds, cc);

        // Get game price
        for (let gameId in gamesPriceData) {
            const priceData = gamesPriceData[gameId];

            if (!priceData.success) continue;

            const priceOverview = priceData.data.price_overview;

            // Check the game is free or the price is currently not available
            if (!priceOverview) {
                for (const game of top20MatchedGames) {
                    if (game.appid == gameId) {
                        const gameDetails = await fetchGameDetails(gameId, cc);

                        if (!gameDetails.success) continue;

                        const isFree = gameDetails.data.is_free;
                        game.finalPrice = isFree ? "Free" : "TBA";
                    }
                }

                continue;
            }

            top20MatchedGames.forEach((game) => {
                if (game.appid == gameId) {
                    if (priceOverview.discount_percent) {
                        game.discountPercent = priceOverview.discount_percent;
                        game.initialPrice = priceOverview.initial_formatted;
                    }
                    game.finalPrice = `${priceOverview.final_formatted}`;
                }
            });
        }

        // Messages will be send to client
        let messages = ["**Hehe! I got some stuff for you**\n"];

        for (const game of top20MatchedGames) {
            if (!game.finalPrice) continue;

            const message = formatMessage(game);
            messages.push(message);
        }

        messages = messages.join("\n");
        await interaction.editReply(messages);
    },
};
