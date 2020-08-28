import { Client, Message } from 'discord.js';

import * as getMaps from '../handlers/getMap';
import * as mods from '../handlers/mods';
import * as argument from '../handlers/argument';
import * as error from '../handlers/error';

const axios = require('axios');

function execute(client: Client, msg: Message, args: Array<string>) {
	getMaps.getMaps(client, msg, function (clientFunc, msgFunc, URLData, userid) {
		let options = argument.parse(msg, args);
		if (options.error) return;

		axios.get(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&b=${URLData.beatmapID}&limit=25`)
			.then((res: any) => {
			
				let fields = [];
				for (let i = 0; i < res.data.length; i++) {
					fields.push({
						name: `**${i + 1}. ${client.emojis.find(emoji => emoji.name === 'grade_' + res.data[i].rank.toLowerCase())} ${res.data[i].username} +${mods.toString(res.data[i].enabled_mods)}**`,
						value: `${Math.floor(res.data[i].pp)}pp [${res.data[i].count300}/${res.data[i].count100}/${res.data[i].count50}/${res.data[i].countmiss}] x${res.data[i].maxcombo}`,
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
			}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});
	});
}

module.exports = {
	name: 'leaderboard',
	description: 'Displays the top 25 players on the last mentioned map',
	aliases: ['lb'],
	group: 'osu',
	execute: execute
};