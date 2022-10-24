const { SlashCommandBuilder, bold, italic, strikethrough, underscore, spoiler, quote, blockQuote } = require('@discordjs/builders');
const { MessageEmbed, EmbedFieldData } = require('discord.js');
const ListModel = require('../list/list.model');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Create new list')
		.addStringOption(option => option.setName('title').setDescription('Title of the list').setRequired(true))
		.addStringOption(option => option.setName('items').setDescription('Items to add to the list, comma separated').setRequired(false)),
	async execute(interaction) {
		const title = interaction.options.getString('title');
        const items = interaction.options.getString('items');

        if(items != null)
        {
            //CREATE NEW LiST
            let itemsList = [];

            if(items.indexOf(',') > -1)
            {
                itemsList = items.split(',');
            } else {
                itemsList.push(items);
            }

            ListModel.add({title: title, items: itemsList, dateCreated: new Date()})
        } else {
            //GET EXISTING LIST
            const list = await ListModel.get(title);

            if(list == null) {
                await interaction.reply({content: 'List not found :(', ephemeral: true }); 
                return;
            } 

            const listEmbed = new MessageEmbed()
			.setColor('#ad7100')
			.setTitle(list.title.toUpperCase())
			.setFooter({ text: 'Last updated: ' + list.dateUpdated });

            let itemsString = '';

            for(let i = 0;i<list.items.length;i++)
		    {
			    itemsString += '\u2022 ' + list.items[i] + '\n';
		    }

            listEmbed.addField('Items', itemsString, false);

		    await interaction.reply({ embeds: [listEmbed], fetchReply: true })
                .then((message) => console.log(`Reply sent with content ${message.content}`))
                .catch(console.error);
        }
	}
};