require('dotenv').config();
const Discord = require('discord.js');
const http = require('http');
const client = new Discord.Client();
const prefix = process.env.prefix || '$';

http.createServer((req, res) => {
	if (req.url == '/') {
		console.log('Ping');
		res.write('Pong');
		res.end();
	}
}).listen(process.env.PORT || 4000);

// Ping the app evert 5 minutes to prevent the app from sleeping
setInterval(function () {
	http.get(process.env.server.replace('https','http'));
}, 300000);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	let messages = ['osu! | $help', 'https://github.com/moorad/the-beautiful-bot', 'with FL. Imagine not being able to FC with FL lol'];
	let counter = 0;
	client.user.setActivity(messages[counter], {
		type: 'playing'
	}).then(console.log('CHANGED PLAYING'));
	counter = (counter + 1) % messages.length;
	setInterval(() => {
		client.user.setActivity(messages[counter], {
				type: 'playing'
			})
			.then(console.log('CHANGED PLAYING'));
		counter = (counter + 1) % messages.length;
	}, 600000);
});


client.on('message', async msg => {
	msg.content = msg.content.toLowerCase();
	if (msg.author.bot) return;
	if (msg.content == `<@!${client.user.id}>`) require('./commands/help').help(msg, prefix);

	if (msg.content === 'bot you alive?') { // bot are you alive
		msg.reply('**YES!!!**');
	}  
	else if (msg.content === 'good bot') {
		msg.reply('<:heart:' + 615531857253105664 + '>');
	} else if (msg.content.includes('osu.ppy.sh/beatmapsets')) {
		require('./commands/WIP').beatmapCardFromLink(msg);
	} else if (msg.content.includes('osu.ppy.sh/users')) {
		require('./commands/osu').generateUser(msg, msg.content.replace('https://osu.ppy.sh/users/', ''));
	}

	if (!msg.content.startsWith(prefix)) return;
	var args = msg.content.slice(prefix.length).trim().split(' ');
	var cmd = args.shift();


	if (cmd === 'ping') {
		require('./commands/ping').ping(client, msg);
	}else if (cmd == 'osu') {
		require('./commands/osu').osu(client, msg, args);
	} else if (cmd == 'rs' || cmd == 'recent') {
		require('./commands/recent').recent(client, msg, args);
	} else if (cmd == 'bt' || cmd == 'best') {
		require('./commands/best').best(client, msg, args);
	} else if (cmd == 'mp' || cmd == 'map') {
		require('./commands/map').search(msg, args);
	} else if (cmd == 'os' || cmd == 'osuset') {
		require('./commands/set').set(msg, args);
	} else if (cmd == 'hl' || cmd == 'help') {
		require('./commands/help').help(msg, prefix);
	} else if (cmd == 'cl' || cmd == 'changelog') {
		require('./commands/changelog').changelog(msg);
	} else if (cmd == 'c' || cmd == 'compare') {
		require('./commands/compare').compare(client, msg);
	} else if (cmd === 'cat') {
		require('./commands/cat').cat(msg);	
	} else if (cmd == 'leaderboard' || cmd == 'lb') {
		require('./commands/leaderboard').leaderboard(client,msg);
	}
});

client.login(process.env.discordAPI);