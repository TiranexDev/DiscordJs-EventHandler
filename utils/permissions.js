const { MessageEmbed, Permissions } = require("discord.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../config/db.env') });
const connection = require('../db/connection.js')

deleteUnwantedProps = (permissions, defaultSet) => {
	let objectKeys = Object.keys(permissions);
	for (let i = 0; i < objectKeys.length; i++) {
		if (!defaultSet.includes(objectKeys[i])) {
			delete permissions[objectKeys[i]];
		}
	}
	return permissions;
};

validatePerms = async (user, permissions, types) => {
	let result = {
		unknownPerms: [],
		unavailablePerms: [],
	};
	permissions.forEach((permission) => {
		if (!permissionsList.includes(permission)) {
			result.unknownPerms.push(permission);
		}
		if (types.includes("unavailablePerms") && !user.permissions.has(permission)) {
			result.unavailablePerms.push(permission);
		}
	});
	return result;
};

sendPermsErrors = async (problems, sendMessage) => {
	connection.promise().query(`SELECT lang FROM guildconfig WHERE guildId = '${sendMessage.guild.id}'`).then(result => {
		if (problems.bot.unavailablePerms.includes("SEND_MESSAGES")) {
		} else if (problems.bot.unavailablePerms.includes("EMBED_LINKS")) {
			returnMsg = `This bot requires access to display embeds in order to function properly! `;
			if (problems.bot.unavailablePerms.length > 1) {
				returnMsg += `It also requires ${problems.bot.unavailablePerms.map(
					(perm) => (perm != "EMBED_LINKS" ? `\`${perm}\`` : null)
				)} for this specific command. Set the specific permissions and try again`;
			}
			sendMessage.send(returnMsg);
		} else {
			returnMsg = new MessageEmbed()
			if (result[0][0].lang == 'English') {
				returnMsg.setTitle("MISSING PERMISSIONS")
					.setDescription("There are unmet permissions requirements!")

			} else if (result[0][0].lang == 'Russian') {
				returnMsg.setTitle("Отсутствие Разрешений")
					.setDescription("Есть неудовлетворенные требования к разрешениям!")
			}
			if (problems.bot.unavailablePerms.length != 0) {
				if (result[0][0].lang == 'English') {
					returnMsg.addField(
						"Unmet bot permissions:",
						problems.bot.unavailablePerms.join(" | ")
					);
				} else if (result[0][0].lang == 'Russian') {
					returnMsg.addField(
						"Неудовлетворенные разрешения бота:",
						problems.bot.unavailablePerms.join(" | ")
					);
				}
			}
			if (problems.user.unavailablePerms.length != 0) {
				if (result[0][0].lang == 'English') {
					returnMsg.addField(
						"Unmet user permissions:",
						problems.user.unavailablePerms.join(" | ")
					);
				} else if (result[0][0].lang == 'Russian') {
					returnMsg.addField(
						"Неудовлетворенные разрешения пользователей:",
						problems.user.unavailablePerms.join(" | ")
					);
				}
			}
			returnMsg.setColor(process.env.error);
			sendMessage.send({ embeds: [returnMsg] });
		}
	});
}

logPermsProblems = (result, commandName) => {
	let returnMsg = `Unknown permissions detected in command "${commandName}"!\n`;
	if (result.bot.unknownPerms.length > 0) {
		returnMsg += "\nUnknown bot permissions:";
		for (let i = 0; i < result.bot.unknownPerms.length; i++)
			returnMsg += `    ${result.bot.unknownPerms[i]}`;
	}
	if (result.user.unknownPerms.length > 0) {
		returnMsg += "\nUnknown user permissions:";
		for (let i = 0; i < result.user.unknownPerms.length; i++)
			returnMsg += `    ${result.user.unknownPerms[i]}`;
	}
	returnMsg += "\n";
	console.log(returnMsg);
};

onMessagePermissionCheck = async (client, message, command) => {
	let typeSets = { users: ["bot", "user"], perms: ["unavailablePerms"] },
		user = await message.guild.members.cache.get(message.author.id),
		bot = await message.guild.members.cache.get(client.user.id),
		result = {};

	let permissions = await deleteUnwantedProps(
		command.permissions,
		typeSets.users
	);

	if (!permissions.bot.includes("SEND_MESSAGES"))
		permissions.bot.push("SEND_MESSAGES");
	if (!permissions.bot.includes("EMBED_LINKS"))
		permissions.bot.push("EMBED_LINKS");

	if (permissions.user.constructor == Array) {
		result.user = await deleteUnwantedProps(
			await validatePerms(user, permissions.user, typeSets.perms),
			typeSets.perms
		);
	}
	if (permissions.bot.constructor == Array) {
		result.bot = await deleteUnwantedProps(
			await validatePerms(bot, permissions.bot, typeSets.perms),
			typeSets.perms
		);
	}

	if (
		result.bot.unavailablePerms.length == 0 &&
		result.user.unavailablePerms.length == 0
	) {
		return true;
	} else {
		sendPermsErrors(result, message.channel);
		return false;
	}
};

onInitPermissionCheck = async (client, command) => {
	let typeSets = { users: ["bot", "user"], perms: ["unknownPerms"] },
		bot = await client.users.cache.find((user) => user.id === client.user.id),
		result = {};
	let permissions = await deleteUnwantedProps(
		command.permissions,
		typeSets.users
	);

	if (permissions.user.constructor == Array) {
		result.user = await deleteUnwantedProps(
			//? user permissions validation is permitted with bot here as it only tests for the existance of a permission in the permission list
			await validatePerms(bot, permissions.user, typeSets.perms),
			typeSets.perms
		);
	}
	if (permissions.bot.constructor == Array) {
		result.bot = await deleteUnwantedProps(
			await validatePerms(bot, permissions.bot, typeSets.perms),
			typeSets.perms
		);
	}
	if (
		result.bot.unknownPerms.length == 0 &&
		result.user.unknownPerms.length == 0
	) {
		return true;
	} else {
		logPermsProblems(result, command.name);
		return false;
	}
};

module.exports = { onMessagePermissionCheck, onInitPermissionCheck };



permissionsList = [
	Permissions.FLAGS.CREATE_INSTANT_INVITE,
	Permissions.FLAGS.KICK_MEMBERS,
	Permissions.FLAGS.BAN_MEMBERS,
	Permissions.FLAGS.ADMINISTRATOR,
	Permissions.FLAGS.MANAGE_CHANNELS,
	Permissions.FLAGS.MANAGE_GUILD,
	Permissions.FLAGS.ADD_REACTIONS,
	Permissions.FLAGS.VIEW_AUDIT_LOG,
	Permissions.FLAGS.PRIORITY_SPEAKER,
	Permissions.FLAGS.STREAM,
	Permissions.FLAGS.VIEW_CHANNEL,
	Permissions.FLAGS.SEND_MESSAGES,
	Permissions.FLAGS.SEND_TTS_MESSAGES,
	Permissions.FLAGS.MANAGE_MESSAGES,
	Permissions.FLAGS.EMBED_LINKS,
	Permissions.FLAGS.ATTACH_FILES,
	Permissions.FLAGS.READ_MESSAGE_HISTORY,
	Permissions.FLAGS.MENTION_EVERYONE,
	Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
	Permissions.FLAGS.VIEW_GUILD_INSIGHTS,
	Permissions.FLAGS.CONNECT,
	Permissions.FLAGS.SPEAK,
	Permissions.FLAGS.MUTE_MEMBERS,
	Permissions.FLAGS.DEAFEN_MEMBERS,
	Permissions.FLAGS.MOVE_MEMBERS,
	Permissions.FLAGS.USE_VAD,
	Permissions.FLAGS.SEND_MESSAGES_IN_THREADS,
	Permissions.FLAGS.CHANGE_NICKNAME,
	Permissions.FLAGS.MANAGE_NICKNAMES,
	Permissions.FLAGS.MANAGE_ROLES
];
