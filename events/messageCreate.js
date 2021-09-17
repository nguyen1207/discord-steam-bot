module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (message.author.bot && message.author.username == "Steam Bot")
            return;
		
        
        try {
            await message.reply(
                `${message.member.nickname} said: ${message.content}`
            );
        } catch (error) {
            await message.reply({
                content: "Send messages error",
            });
        }
    },
};
