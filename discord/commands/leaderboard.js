const { SlashCommandBuilder, bold, italic, strikethrough, underscore, spoiler, quote, blockQuote } = require('@discordjs/builders');
const { MessageEmbed, EmbedFieldData } = require('discord.js');
const LeaderboardModel = require('../../leaderboard/leaderboard.model');
const ConfigModel = require('../../config/config.model');
const LeaderboardController = require('../../leaderboard/leaderboard.controller');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Get leaderboard from TrainerTonny')
		.addIntegerOption(option => option.setName('year').setDescription('Optional year to get leaderboard data').setRequired(false))
		.addStringOption(option => 
			option.setName('category')
			.setDescription('Category for the leaderboard')
			.setRequired(false)
			.addChoice('Distance', 'distance')
			.addChoice('Time', 'time')
			.addChoice('Elevation', 'elevation')
			.addChoice('Rides', 'rides')),
	async execute(interaction) {
		let year = interaction.options.getInteger('year') != null ? interaction.options.getInteger('year') : new Date().getFullYear();
		if(year > new Date().getFullYear()) year = new Date().getFullYear();
		if(year < 2016) year = 2016;
		const category = interaction.options.getString('category') != null ?  interaction.options.getString('category') : 'distance';

		const lb = await LeaderboardModel.get()
    		.then((result) => {
				const r = ConfigModel.get()
					.then((c) => {  
						return LeaderboardController.formatData(result, c.leaderboardRefreshed);
					})
					.catch(console.error);

				return r;
			})
			.catch(console.error);

		const data = lb.leaderboard.filter(lb => lb.year == year)[0];
		let result;
		let imgUrl = 'https://tonny.icu/assets/img/podium/';
		let unit;
		let color;

		switch(category)
		{
			case 'distance': result = data.distance; imgUrl += 'yellow/'; unit = ' km'; color = '#fcff00;'; break;
			case 'time': result = data.time; imgUrl += 'green/'; unit = ' mins'; color = '#00ff44'; break;
			case 'elevation': result = data.elevation; imgUrl += 'polka/'; unit = ' meters'; color = '#ff0000;'; break;
			case 'rides': result = data.rides; imgUrl += 'white/'; unit = ' rides'; color = '#fff'; break;
		}

		const lbEmbed = new MessageEmbed()
			.setColor(color)
			.setTitle(category.toUpperCase() + ' LEADERBOARD ' + data.year)
			.setURL('https://tonny.icu/#/leaderboard')
			.setImage(imgUrl + result[0].name.replace(' ', '%20') + '.png')
			.setFooter({ text: 'Last updated: ' + lb.refreshDate });

		for(let i = 0;i<result.length;i++)
		{
			lbEmbed.addField((i+1) + '. ' + result[i].name + ': ' + result[i].value + unit, '\u200B');
		}

		interaction.reply({ embeds: [lbEmbed] });
	}
};