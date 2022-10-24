const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		console.log(interaction.channel);
		interaction.channel.send('test123')
			.then(message => console.log(`Sent message: ${message.content}`))
			.catch(console.error);
		await interaction.reply('Pong!');
	}
};