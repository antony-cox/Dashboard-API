const fs = require('node:fs');
const path = require('path');
const { SlashCommandBuilder, bold, italic, quote, blockQuote } = require('@discordjs/builders');
const VaultModel = require('../vault/vault.model');

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

		chatHistory = chatHistory.filter(c => c.photos != null || c.videos != null);
		chatHistory.sort((a,b) => a.timestamp_ms - b.timestamp_ms);

		for(let i = 0;i<chatHistory.length;i++)
		{
			const c = chatHistory[i];
			if(c.sender_name === 'C\u00c3\u00a9dric Van Soom') c.sender_name = 'Cédric Van Soom';

			if(c.photos != null)
			{
				for(let y = 0;y<c.photos.length;y++)
				{
					const p = c.photos[y];

					let vault = {
						id: c.timestamp_ms,
						username: c.sender_name,
						timestamp: c.timestamp_ms,
						name: '',
						url: 'assets/allerlei/photos/' + p.uri.split('/')[4],
						channel: 'Messenger'
					}

					VaultModel.add(vault);
				}
			}

			if(c.videos != null)
			{
				for(let y = 0;y<c.videos.length;y++)
				{
					const v = c.videos[y];

					let vault = {
						id: c.timestamp_ms,
						username: c.sender_name,
						timestamp: c.timestamp_ms,
						name: '',
						url: 'assets/allerlei/videos/' + v.uri.split('/')[4],
						channel: 'Messenger'
					}

					VaultModel.add(vault);
				}
			}
		}
	}
};