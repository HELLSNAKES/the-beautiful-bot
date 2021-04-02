import { Message } from 'discord.js';
import * as database from './handlers/database';
import * as error from './handlers/error';
import * as format from './handlers/format';
import * as levenshtein from './handlers/levenshtein';
import * as cache from './handlers/cache';

require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const parser = require('./handlers/parser');
const fs = require('fs');

const mapFeedRate = 180000; // 180000 = 3 min in milliseconds
const lastUpdated = new Date(1601258498350);
const distanceThresholdAbsolute = 0.5;

export function preCache() {
	database.read('users', {}, { noLogs: true })
		.then((docs) => {
			cache.set('users', docs).then(() => {
				console.log('PRE CACHE : USERS COLLECTION');
				database.read('servers', {}, { noLogs: true })
					.then((docs) => {
						cache.set('servers', docs)
							.then(() => console.log('PRE CACHE : SERVERS COLLECTION'))
							.catch(err => error.unexpectedError(err, 'While settign the precache for server'));
					}).catch(err => error.unexpectedError(err, 'While precaching servers'));
			}).catch(err => error.unexpectedError(err, 'While setting the precache for users'));
		}).catch(err => error.unexpectedError(err, 'While precaching users'));
}

preCache();

function isAlias(command: string, clientCommand: string) {
	return client.commands.get(clientCommand).aliases && client.commands.get(clientCommand).aliases.includes(command);
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	let messages = ['osu!', 'https://github.com/moorad/the-beautiful-bot', 'with FL. Imagine not being able to FC with FL lol', `I'm in a total of ${client.guilds.size} servers`, `I was last updated ${format.time(lastUpdated.getTime())} ago`];
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

	// map feed
	// setInterval(() => {
	// 	require('./commands/mapfeed').sendFeed(client);
	// }, mapFeedRate);
});

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file: any) => file.endsWith('.js') || file.endsWith('.ts'));

for (let i of commandFiles) {
	let command = require(`./commands/${i}`);
	client.commands.set(command.name, command);
}


client.on('message', async (msg: Message) => {

	if ((msg.author.bot && process.env.test == '0') || msg.author.id == client.user.id) return;

	if (msg.content === 'bot you alive?') {
		msg.reply('**YES!!!**');
	} else if (msg.content === 'good bot') {
		msg.reply('<:heart:' + 615531857253105664 + '>');
	} else if (msg.content.toLowerCase() === 'tbb wrong map') {
		msg.channel.send('Your score was not submitted for one the following reasons:\n1 - The map is unranked (i.e. unsubmitted, graveyard, pending or WIP)\n2 - You played with unranked mods (i.e. Relax, AutoPilot, Auto, Cinema, etc.)\n3 - You failed the map in a multiplayer game (Failed multiplayer scores do not get submitted to osu! servers)\n4 - The score was not submitted to osu! servers for some reason (custom difficulty, was not signed in, connection issue, bancho delay, osu API delay, etc)\nNote that other server types such as Gatari have some execptions.');
	} else if (msg.content.includes('osu.ppy.sh/beatmapsets') || msg.content.includes('osu.ppy.sh/b') || msg.content.includes('osu.ppy.sh/s')) {
		require('./commands/url').beatmapCardFromLink(msg);
	} else if (parser.userURL(msg.content).success) {
		require('./commands/osu').requestData(msg, parser.userURL(msg.content).userId);
	} else if (msg.attachments.size > 0 && msg.attachments.first().filename.endsWith('.osr')) {
		require('./commands/replay').execute(client, msg, msg.attachments.first().url);
	}

	var prefix = process.env.prefix || '$';
	database.read('servers', { serverID: msg.guild.id }, { noLogs: true})
		.then((docs) => {
			if (docs.length != 0 && docs[0].prefixOverwrite) prefix = docs[0].prefixOverwrite;

			if (msg.content == `<@!${client.user.id}>`) require('./commands/help').execute(client, msg, '', prefix);

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
				client.commands.get('map').execute(client, msg, args);
			} else if (cmd === 'set' || isAlias(cmd, 'set')) {
				client.commands.get('set').execute(msg, args);
			} else if (cmd === 'help' || isAlias(cmd, 'help')) {
				client.commands.get('help').execute(client, msg, args, prefix);
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
			} else if (cmd === 'prefix' || isAlias(cmd, 'prefix')) {
				client.commands.get('prefix').execute(msg, args);
			} else if (cmd === 'report' || isAlias(cmd, 'report')) {
				client.commands.get('report').execute(msg, args);
			} // else if (cmd === 'config' || isAlias(cmd, 'config')) {
			//  	client.commands.get('config').execute(msg, args);
			// }
			else if (cmd === 'flush') {
				client.commands.get('flush').execute(msg);
			} else if (cmd == 'invite') {
				client.commands.get('invite').execute(msg);
			} else if (cmd == 'mapfeed') {
				client.commands.get('mapfeed').execute(msg, args);
			} else if (cmd == 'roll') {
				client.commands.get('roll').execute(msg, args);
			} else {
				var commands: Array<string> = [];
				client.commands.forEach((command: any) => { if (command.name != undefined) commands.push(command.name); if (command.aliases != undefined) commands = commands.concat(command.aliases); });
				var bestMatch = levenshtein.getBestMatch(commands, cmd);
				var distanceThresholdRelative = Math.floor(cmd.length * (1 - distanceThresholdAbsolute));
				if (bestMatch.distance <= distanceThresholdRelative) {
					msg.channel.send(`:yellow_circle: **Did you mean \`$${bestMatch.string}\`?**\nUse \`$help\` to view the full list of commands available\n- "${cmd}"  → "${bestMatch.string}" (${levenshtein.getPercentageFromDistance(cmd, bestMatch.distance)}% similarity)`);
				}
			}
		}).catch(err => error.unexpectedError(err, 'Running main index.js function'));
});

client.login(process.env.discordAPI);

process.on('uncaughtException', (err) => {
	error.unexpectedError(err, 'Uncaught Exception');
});

process.on('warning', (err) => {
	error.unexpectedError(err, 'Warning');
});