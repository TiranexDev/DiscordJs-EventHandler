const { Collection, Permissions, Client, Intents} = require('discord.js');
const client = new Client({ intents: [32767] });
const fs = require('fs');
const path = require('path');
const connection = require('./db/connection.js')
require('dotenv').config({ path: path.resolve(__dirname, './config/bot.env') });

client.commands = new Collection();
client.aliases = new Collection();

fs.readdir('./events/', (err, files) => {
	const eventHandler = require('./handler/eventHandler.js');
	eventHandler(err, files, client);
});
fs.readdir('./commands/', (err, files) => {
	const commandHandler = require('./handler/commandHandler.js');
	commandHandler(err, files, client);
});


var http = require('http');  
http.createServer(function (req, res) {   
  res.write("I'm alive");   
  res.end(); 
}).listen(8080); 

client.login(process.env.BOT_TOKEN);




