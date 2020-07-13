'use strict';

import { Client, Message } from 'discord.js';

import * as mods from '../handlers/mods';
import * as pp from '../handlers/pp';
import * as getMap from '../handlers/getMap';
import * as argument from '../handlers/argument';

const request = require('request');

function execute(client: Client, msg: Message, args: string) {
	getMap.getMaps(client, msg, (msgFunc, clientFunc, URLData, userid) => {
		pp.calculatepp(URLData.beatmapID!, argument.parseOjsama(args), (json: any) => {
			request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${json.beatmapId}`, {
				json: true
			}, (err: any, res: any, body: any) => {
				json.pp = Math.round(json.pp * 100) / 100;
				if (mods.has(mods.toValue(json.mods), 'DT')) body[0].bpm *= 1.5;
				else if (mods.has(json.mods, 'HT')) body[0].bpm *= 0.75;
				msg.channel.send(`:blue_circle: That is worth **${json.pp}pp**\n\`${(json.mods == '' ? 'No Mod' : json.mods)}\` \`${Math.round(parseFloat(json.accuracy) * 10) / 10}%\` \`${json.combo}/${json.maxCombo}x\` \`BPM: ${body[0].bpm}\` \`AR: ${json.AR}\` \`OD: ${json.OD}\` \`CS: ${json.CS}\` \`HP: ${json.HP}\` \`★: ${json.stars}\``);
			});
		});
		console.log(`PP : ${userid} : ${URLData.URL}`);
	});
}

module.exports = {
	name: 'pp',
	description: 'Calculates the pp of the last mentioned map',
	group: 'osu',
	options: argument.getPerformancePointsArgumentDetails(),
	example: 'https://imgur.com/SLr7kLt.jpg',
	execute: execute
};