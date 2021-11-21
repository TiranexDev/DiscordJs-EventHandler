const { MessageReaction, MessageEmbed } = require('discord.js');
const path = require('path');
const prompt = require('prompt-sync')()
const connection = require('../db/connection.js')
require('dotenv').config({ path: path.resolve(__dirname, '../config/links.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../config/bot.env') });
module.exports = {
    name: 'blacklist',
    description: ({
        'eng': 'Blacklist a user from using the bot! Or update the reason...',
        'rus': 'Заблокируйте пользователя для использования этого бота! Или обновите причину...'
    }),
    aliases: ['bl', 'blist', 'block'],
    usage: ({
        'eng': '(user id or user mention) (reason optional)',
        'rus': '(айди пользователя или его упоминание) (причина по желанию)'
    }),
    guildOnly: false,
    args: false,
    permissions: {
        bot: [],
    },

    execute: async (message, args, client) => {
        function blacklisting(user, reason) {
            connection.query(`INSERT IGNORE INTO blacklisted (user, reason) VALUES ('${user.id}', '${reason}')`)
            connection.query(`
        UPDATE blacklisted
        SET reason = '${reason}', user = '${user.id}'
        WHERE user = '${user.id}'; 
        `)
        }
        function blacklistingnoreason(user) {
            connection.query(`INSERT IGNORE INTO blacklisted (user) VALUES ('${user.id}')`)
            connection.query(`
        UPDATE blacklisted
        SET reason = NULL, user = '${user.id}'
        WHERE user = '${user.id}'; 
        `)
        }
        connection.promise().query(`SELECT lang FROM guildconfig WHERE guildId = '${message.guild.id}'`).then(result => {
            if (message.author.id != process.env.bot_author_id) return message.reply("not creator of bot");

            if (!args[0]) {
                return message.reply("enter a id");
            }
            var user = client.users.fetch(args[0]).then((result) => {
                var theuser = result
                if (args.slice(1).join(" ") == "") {
                    blacklistingnoreason(theuser)
                } else {
                    blacklisting(theuser, args.slice(1).join(" "))
                    let embedsuc = new MessageEmbed()
                        .setColor(process.env.default)
                        .setThumbnail(client.user.displayAvatarURL())
                        .setAuthor(client.user.username, client.user.displayAvatarURL())
                    if (result[0][0].lang == 'Russian') {
                        embedsuc.setTitle("Удачно!")
                        return message.reply({ embeds: [embedsuc] })
                    }
                    else if (result[0][0].lang == 'English') {
                        embedsuc.setTitle("Success!")
                        message.reply({ embeds: [embedsuc] })
                    }
                }
            }).catch(err => {
                try {
                    user = message.mentions.users.first()

                    var theuser = user
                    if (args.slice(1).join(" ") == "") {
                        blacklistingnoreason(theuser, args.slice(1).join(" "))
                        message.reply(`Sucessfully added ${theuser.username}#${theuser.discriminator} (${theuser.id})`)
                    } else {
                        blacklisting(theuser, args.slice(1).join(" "))
                        let embedsuc = new MessageEmbed()
                            .setColor(process.env.default)
                            .setThumbnail(client.user.displayAvatarURL())
                            .setAuthor(client.user.username, client.user.displayAvatarURL())
                        if (result[0][0].lang == 'Russian') {
                            embedsuc.setTitle("Удачно!")
                            .setDescription()
                            return message.reply({ embeds: [embedsuc] })
                        }
                        else if (result[0][0].lang == 'English') {
                            embedsuc.setTitle("Success!").setDescription((`Sucessfully added ${theuser.username}#${theuser.discriminator} (${theuser.id})`))
                            message.reply({ embeds: [embedsuc] })
                        }
                    }
                } catch (e) {
                    throw err;
                }

            })

        });
    }
}
