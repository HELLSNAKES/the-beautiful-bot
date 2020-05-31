'use strict';

import { Message } from 'discord.js';

require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = process.env.prefix || '$';
const parser = require('./handlers/parser');
const fs = require('fs');

function isAlias(command: string, clientCommand: string) {
	return client.commands.get(clientCommand).aliases && client.commands.get(clientCommand).aliases.includes(command);
}

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
const commandFiles = fs.readdirSync('./commands').filter((file: any) => file.endsWith('.js') || file.endsWith('.ts'));

for (let i of commandFiles) {
	let command = require(`./commands/${i}`);
	client.commands.set(command.name, command);
}


client.on('message', async (msg: Message) => {
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
	} else if (msg.attachments.first().filename.endsWith('.osr')) {
		require('./commands/replay').execute(client, msg, msg.attachments.first().url);
	}

	if (!msg.content.startsWith(prefix)) return;
	let args = msg.content.slice(prefix.length).trim().split(/ +/);
	let cmd = args.shift()!.toLowerCase();

	if (cmd === 'ping' || isAlias(cmd, 'ping')) {
		client.commands.get('ping').execute(client, msg);
	} else if (cmd === 'osu' || isAlias(cmd, 'osu')) {
		client.commands.get('osu').execute(msg, args, 0);
	} else if (cmd === 'taiko') {
		client.commands.get('osu').execute(msg, args, 1);
	} else if (cmd === 'catch') {
		client.commands.get('osu').execute(msg, args, 2);
	} else if (cmd === 'mania') {
		client.commands.get('osu').execute(msg, args, 3);
	} else if (cmd === 'recent' || isAlias(cmd, 'recent')) {
		client.commands.get('recent').execute(client, msg, args);
	} else if (cmd === 'best' || isAlias(cmd, 'best')) {
		client.commands.get('best').execute(client, msg, args);
	} else if (cmd === 'map' || isAlias(cmd, 'map')) {
		client.commands.get('map').execute(msg, args);
	} else if (cmd === 'set' || isAlias(cmd, 'set')) {
		client.commands.get('set').execute(msg, args);
	} else if (cmd === 'help' || isAlias(cmd, 'help')) {
		client.commands.get('help').execute(client, msg, args);
	} else if (cmd === 'changelog' || isAlias(cmd, 'changelog')) {
		client.commands.get('changelog').execute(msg);
	} else if (cmd === 'compare' || isAlias(cmd, 'compare')) {
		client.commands.get('compare').execute(client, msg, args);
	} else if (cmd === 'cat' || isAlias(cmd, 'cat')) {
		client.commands.get('cat').execute(msg);
	} else if (cmd === 'leaderboard' || isAlias(cmd, 'leaderboard')) {
		client.commands.get('leaderboard').execute(client, msg, args);
	} else if (cmd === 'pp' || isAlias(cmd, 'pp')) {
		client.commands.get('pp').execute(client, msg, args.join(' '));
	} else if (cmd === 'modeset' || isAlias(cmd, 'modeset')) {
		client.commands.get('modeset').execute(msg, args);
	}
});

client.login(process.env.discordAPI);