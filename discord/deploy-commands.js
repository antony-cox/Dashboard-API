require('dotenv').config();

const fs = require('node:fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token, tonnyServer, allerleiServer } = require('./config.json');
const restoreHistory = require('./commands/restoreHistory');

const commands = [];
const commandFiles = fs.readdirSync(path.resolve('discord/commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	if (file != 'ping.js' && file != 'restoreHistory.js')
	{
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, tonnyServer), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);