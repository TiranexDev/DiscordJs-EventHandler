const connection = require('../db/connection.js');

module.exports = {
    event: 'guildDelete',
    run: async (guild) => {
        connection.query(`DELETE FROM guildconfig WHERE guildId='${guild.id}'; `)
        console.log(`A guild has deleted our bot, id of guild: ${guild.id}`)
    },
};
