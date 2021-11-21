const connection = require('../db/connection.js');

module.exports = {
    event: 'guildCreate',
    run: async (guild) => {
        connection.query(`INSERT INTO guildconfig (guildId) VALUES ('${guild.id}'); `)
        console.log(`New guild added bot, id of guild: ${guild.id}`)
    },
};
