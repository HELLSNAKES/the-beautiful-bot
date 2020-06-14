'use strict';

import { Client, Message } from 'discord.js';

import * as getMaps from '../handlers/getMap';
import * as mods from '../handlers/mods';
import * as argument from '../handlers/argument';

const request = require('request');

function execute(client: Client, msg: Message, args: Array<string>) {
	getMaps.getMaps(client, msg, function (clientFunc, msgFunc, URLData, userid) {
		let options = argument.parse(msg, args);
		if (options.error) return;

		request(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&b=${URLData.beatmapID}&limit=25`, (err: any, res: any, body: any) => {
			body = JSON.parse(body);
			let fields = [];
			for (let i = 0; i < body.length; i++) {
				fields.push({
					name: `**${i + 1}. ${client.emojis.find(emoji => emoji.name === 'grade_' + body[i].rank.toLowerCase())} ${body[i].username} +${mods.toString(body[i].enabled_mods)}**`,
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
			console.log(`LEADERBOARD : ${userid} : ${URLData.URL}`);
		});
	});
}

module.exports = {
	name: 'leaderboard',
	description: 'Displays the top 25 players on the last mentioned map',
	aliases: ['lb'],
	group: 'osu',
	execute: execute
};