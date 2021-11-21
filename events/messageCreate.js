const { MessageEmbed } = require('discord.js');
const connection = require('../db/connection.js')
const { botPermissionCheck } = require('../utils/permissions.js');
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../config/color.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../config/links.env') });
module.exports = {
	event: 'messageCreate',
	run: async (message, client) => {
		var { prefix } = connection.promise().query(`SELECT cmdPrefix FROM guildconfig WHERE guildId = '${message.guild.id}'`).then(result => {
			prefix = result[0][0].cmdPrefix
			connection.promise().query(`SELECT lang FROM guildconfig WHERE guildId = '${message.guild.id}'`).then(result => {
				var lang = result[0][0].lang
				if (!message.content.startsWith(prefix) || message.author.bot) return;
				const args = message.content.slice(prefix.length).split(/ +/);
				const commandName = args.shift().toLowerCase();
				const command =
					client.commands.get(commandName) ||
					client.commands.find(
						(cmd) => cmd.aliases && cmd.aliases.includes(commandName)
					);
				if (!command) return;
				if (command.guildOnly && message.channel.type !== "text") {
					return message.reply("I can't execute that command inside DMs! / Бот не может запускать команду в личных соообщениях!");
				}

				if (command.args && !args.length) {
					let reply = `You didn't provide any arguments, ${message.author}!`;
					if (command.usage) {
						reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
					}
					return message.channel.send(reply);
				}

				if (
					command.permissions &&
					(command.permissions.bot || command.permissions.user)
				) {
					if (!command.permissions.bot) command.permissions.bot = [];
					if (!command.permissions.user) command.permissions.user = [];
					let wasSuccessful = onMessagePermissionCheck(
						client,
						message,
						command
					);
					if (!wasSuccessful) return;
				}

				try {
					connection.promise().query(`SELECT ${message.author.id} FROM blacklisted WHERE user = '${message.author.id}'`).then(result => {
						var wrong;
						if (result[0][0] != undefined) {
							wrong = 1;
							connection.promise().query(`SELECT reason FROM blacklisted WHERE user = '${message.author.id}'`).then(result => {
								let blacklistedem = new MessageEmbed()
									.setThumbnail(techsupport_img)
									.setAuthor(client.user.username, client.user.displayAvatarURL())
									.setColor(colors.default)
								if (lang == 'Russian') {
									blacklistedem.setTitle("Ошибка!")
									if (!String(result[0][0].reason).includes(null)) {
										blacklistedem.setDescription(`Вы были заблокированы для использования данного бота, причина: "${result[0][0].reason}". Если вы думаете что это ошибка зайдите на [сервер поддержки]${techsupportlink}) и подайте аппеляцию.`)
									} else {
										blacklistedem.setDescription(`Вы были заблокированы для использования данного бота, причина неизвестна. Если вы думаете что это ошибка зайдите на [сервер поддержки](${techsupportlink}) и подайте аппеляцию.`)
									}
								} else if (lang == 'English') {
									blacklistedem.setTitle("Error!")
									if (String(result[0][0].reason).includes(null)) blacklistedem.setDescription(`You've been blacklisted to use this for: "${result[0][0].reason}". If you think this was a mistake join the [support server](${techsupportlink}) and do a appeal.`)
									else blacklistedem.setDescription(`You've been blacklisted to use this for unkown reason. If you think this was a mistake join the [support server](${techsupportlink}) and do a appeal.`)
								}
								blacklistedem.setFooter(client.user.username, client.user.displayAvatarURL())
									.setTimestamp()
								message.reply({ embeds: [blacklistedem] });
								return;
							});

						}
						if (wrong == 1) return;
						command.execute(message, args, client);

					});
				} catch (error) {
					console.error(error);
					if (lang == 'English') message.reply("There was an error trying to execute that command!");
					else if (lang == 'Russian') message.reply("Ошибка воспроизведения команды!");
				}
			});
		});
	},
};
