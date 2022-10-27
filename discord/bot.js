require('dotenv').config();

const path = require('path');
const fs = require('node:fs');
const { token } = require('./config.json');
const { Client, Collection, Intents } = require('discord.js');
const VaultModel = require('./vault/vault.model');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// client.commands = new Collection();

// const commandFiles = fs.readdirSync(path.resolve('discord/commands')).filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
// 	const command = require(`./commands/${file}`);
// 	client.commands.set(command.data.name, command);
// }

client.once('ready', c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// client.on('interactionCreate', async interaction => {
// 	if (!interaction.isCommand()) return;

//     const command = client.commands.get(interaction.commandName);

// 	if (!command) return;

// 	try {
// 		await command.execute(interaction);
// 	} catch (error) {
// 		console.error(error);
// 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// 	}
// });

//Listen to new messages on the server
client.on("messageCreate", (message) => {
	if(message.attachments.size > 0)
	{
		for(let i = 0;i<message.attachments.size;i++)
		{
			let attachment = message.attachments.at(i);
			let vaultData = {
				id: attachment.id,
				username: message.author.username,
				timestamp: message.createdTimestamp,
				name: attachment.name,
				url: attachment.url,
				channel: message.channel.name,
				content: message.content
			}

			VaultModel.add(vaultData);
		}
	}
})
  
client.login(token);