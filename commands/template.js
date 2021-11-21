const { MessageEmbed, Permissions } = require("discord.js");
const path = require("path");
const connection = require('../db/connection.js');
require('dotenv').config({ path: path.resolve(__dirname, '../config/links.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../config/db.env') });
module.exports = {
    name: 'template',
    description: ({
        'eng': 'Any description here!',
        'rus': 'Какое нибудь описание сюда!'
    }),
    aliases: ['any', 'aliases', 'here', 'or', 'just', 'let', 'it', 'empty'],
    usage: ({
        'eng': '',
        'rus': ''
    }),
    guildOnly: false,
    args: false,
    permissions: {
        bot: [],
    },
    execute: async (message, args, client) => {
            connection.promise().query(`SELECT lang FROM guildconfig WHERE guildId = '${message.guild.id}'`).then(result => {
                var lang = result[0][0].lang;
                let inviteembed = new MessageEmbed()
                    .setThumbnail(client.user.displayAvatarURL())
                    .setAuthor(client.user.username, client.user.displayAvatarURL())
                    .setColor(process.env.default)
                if (lang == 'Russian') {
                    inviteembed.setTitle("Привет мир!")
                } else if (lang == 'English') {
                    inviteembed.setTitle("Hello World!")
                }
                inviteembed.setFooter(client.user.username, client.user.displayAvatarURL())
                    .setTimestamp()
                return message.reply({ embeds: [inviteembed] })
            });
    },
};