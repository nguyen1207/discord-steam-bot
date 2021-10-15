const CronJob = require("cron").CronJob;
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

    const result = [];
    const specials = data.specials.items;

    // Get daily deal
    for(let category in data) {
        if(data[category].name === "Daily Deal") {
            result.push(data[category]);
            break;
        }
    }
    
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

            const messages = [
                `**Specials today** Updated daily at ${hour.padStart(
                    2,
                    "0"
                )}:${minute.padStart(2, "0")}\n`,
            ];

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

    job.start();
}

module.exports = sendSpecialGamesDaily;