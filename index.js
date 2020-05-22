'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const http = require('http');
const client = new Discord.Client();
const prefix = process.env.prefix || '$';
const parser = require('./handlers/parser');
const fs = require('fs');

http.createServer((req, res) => {
	if (req.url == '/') {
		res.write('Pong');
		res.end();
	}
}).listen(process.env.PORT || 4000);

// Ping the app evert 5 minutes to prevent the app from sleeping
setInterval(function () {
	http.get(process.env.server.replace('https', 'http'));
}, 300000);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	let messages = ['osu!', 'https://github.com/moorad/the-beautiful-bot', 'with FL. Imagine not being able to FC with FL lol', `I'm in a total of ${client.guilds.size} servers`];
	let counter = 0;
	client.user.setActivity(messages[counter], {
		type: 'playing'
	});
	counter = (counter + 1) % messages.length;
	setInterval(() => {
		messages[3] = `I'm in a total of ${client.guilds.size} servers`;
		client.user.setActivity('$help | ' + messages[counter], {
			type: 'playing'
		});
		counter = (counter + 1) % messages.length;
	}, 300000);
});

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (var i of commandFiles) {
	var command = require(`./commands/${i}`);
	client.commands.set(command.name, command);
}


client.on('message', async msg => {
	if (msg.author.bot) return;
	if (msg.content == `<@!${client.user.id}>`) require('./commands/help').help(msg, prefix);

	if (msg.content === 'bot you alive?') { // bot are you alive
		msg.reply('**YES!!!**');
	} else if (msg.content === 'good bot') {
		msg.reply('<:heart:' + 615531857253105664 + '>');
	} else if (msg.content.includes('osu.ppy.sh/beatmapsets')) {
		require('./commands/url').beatmapCardFromLink(msg);
	} else if (parser.userURL(msg.content).success) {
		require('./commands/osu').requestData(msg, parser.userURL(msg.content).userId);
	}

	if (!msg.content.startsWith(prefix)) return;
	var args = msg.content.slice(prefix.length).trim().split(/ +/);
	var cmd = args.shift().toLowerCase();


	if (cmd === 'ping') {
		client.commands.get('ping').execute(client, msg);
	} else if (cmd == 'osu') {
		client.commands.get('osu').execute(msg, args, 0);
	} else if (cmd == 'taiko') {
		client.commands.get('osu').execute(msg, args, 1);
	} else if (cmd == 'catch') {
		client.commands.get('osu').execute(msg, args, 2);
	} else if (cmd == 'mania') {
		client.commands.get('osu').execute(msg, args, 3);
	} else if (cmd == 'rs' || cmd == 'recent') {
		client.commands.get('recent').execute(client, msg, args);
	} else if (cmd == 'bt' || cmd == 'best') {
		client.commands.get('best').execute(client, msg, args);
	} else if (cmd == 'mp' || cmd == 'map') {
		client.commands.get('map').execute(msg, args);
	} else if (cmd == 'os' || cmd == 'osuset') {
		client.commands.get('set').user(msg, args);
	} else if (cmd == 'hl' || cmd == 'help') {
		client.commands.get('help').execute(msg, prefix, args);
	} else if (cmd == 'cl' || cmd == 'changelog') {
		client.commands.get('changelog').execute(msg);
	} else if (cmd == 'c' || cmd == 'compare') {
		client.commands.get('compare').execute(client, msg, args);
	} else if (cmd === 'cat') {
		client.commands.get('cat').execute(msg);
	} else if (cmd == 'leaderboard' || cmd == 'lb') {
		client.commands.get('leaderboard').execute(client, msg, args);
	} else if (cmd == 'pp') {
		client.commands.get('pp').execute(client, msg, args.join(' '));
	} else if (cmd == 'modeset') {
		client.commands.get('set').mode(msg, args);
	}
});

client.login(process.env.discordAPI);