const fs = require('node:fs');
const path = require('path');
const { SlashCommandBuilder, bold, italic, quote, blockQuote } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restorehistory')
		.setDescription('Restore allerlei messenger history in this channel.'),
	async execute(interaction) {
		const chatFiles = fs.readdirSync(path.resolve('discord/allerlei')).filter(file => file.endsWith('.json'));

		let chatHistory = [];

		for (const file of chatFiles) {
			const chats = fs.readFileSync('discord/allerlei/' + file);
			const chatData = JSON.parse(chats);
			chatHistory = chatHistory.concat(chatData.messages);
		}

		chatHistory.sort((a,b) => a.timestamp_ms - b.timestamp_ms);

		let prevName = '';

		for(let i = 0;i<200;i++)
		{
			const c = chatHistory[i];
			let message = '';
			let date = new Date(c.timestamp_ms);

			if(c.sender_name === 'C\u00c3\u00a9dric Van Soom') c.sender_name = 'Cédric Van Soom';
			if(c.content.indexOf('\u00c3\u00a9')) c.content = c.content.replace('\u00c3\u00a9', 'é');
			
			if(c.sender_name === prevName)
			{
				message = quote(c.content);
			} else {
				message = italic(bold(c.sender_name + ' (' + date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear() + ' at ' + date.getHours() + ':' + date.getMinutes() + '):'))
				 			+ '\n' + quote(c.content);
			}
			
			await interaction.channel.send(message)
				.then(message => console.log(message.content))
				.catch(console.error);

			prevName = c.sender_name;
		}

		console.log(chatHistory[99]);
	}
};