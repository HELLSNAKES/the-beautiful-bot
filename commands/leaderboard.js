'use strict';

const getMaps = require('../handlers/getMap');
const request = require('request');
const mods = require('../handlers/mods');
const argument = require('../handlers/argument');

function execute(client, msg, args) {
	getMaps.getMaps(client, msg, function (clientFunc, msgFunc, url, userid) {
		var options = argument.parse(msg, args);
		if (options.error) return;

		request(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&b=${url.slice(url.lastIndexOf('/')+1)}&limit=${options.count}`, (err, res, body) => {
			body = JSON.parse(body);
			var fields = [];
			for (var i = 0; i < body.length; i++) {
				fields.push({
					name: `**${i+1}. ${client.emojis.find(emoji => emoji.name === 'grade_' + body[i].rank.toLowerCase())} ${body[i].username} +${mods.toString(body[i].enabled_mods)}**`,
					value: `${Math.floor(body[i].pp)}pp [${body[i].count300}/${body[i].count100}/${body[i].count50}/${body[i].countmiss}] x${body[i].maxcombo}`,
					inline: true
				});
			}
			const embed = {
				'title': 'Here is the Leaderboard for the most recent mentioned map in this chat',
				'color': 4886754,
				'footer': {
					'icon_url': 'https://i.imgur.com/34evAhO.png',
					'text': 'Always Remember, The beautiful bot loves you <3'
				},
				'fields': fields
			};

			msg.channel.send({
				embed
			});
			console.log(`LEADERBOARD : ${userid} : ${url}`);
		});
	});
}

module.exports = {
	name: 'leaderboard',
	execute: execute
};