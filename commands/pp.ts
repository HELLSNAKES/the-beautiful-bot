import { Client, Message } from 'discord.js';

import * as mods from '../handlers/mods';
import * as pp from '../handlers/pp';
import * as getMap from '../handlers/getMap';
import * as argument from '../handlers/argument';
import * as error from '../handlers/error';
import * as API from '../handlers/API';

function execute(client: Client, msg: Message, args: string) {
	getMap.getMaps(client, msg, (msgFunc, clientFunc, URLData, userid) => {
		pp.calculatepp(URLData.beatmapID!, argument.parseOjsama(args), (json: any) => {
			API.getBeatmap({
				beatmapID: json.beatmapId
			}).then((res: any) => {
				json.pp = Math.round(json.pp * 100) / 100;
				if (mods.has(mods.toValue(json.mods), 'DT')) res[0].bpm *= 1.5;
				else if (mods.has(json.mods, 'HT')) res[0].bpm *= 0.75;
				msg.channel.send(`:blue_circle: That is worth **${json.pp}pp**\n\`${(json.mods == '' ? 'No Mod' : json.mods)}\` \`${Math.round(parseFloat(json.accuracy) * 10) / 10}%\` \`${json.combo}/${json.maxCombo}x\` \`BPM: ${json.BPM}\` \`AR: ${json.AR}\` \`OD: ${json.OD}\` \`CS: ${json.CS}\` \`HP: ${json.HP}\` \`★: ${json.stars}\``);
			}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});
		});
		console.log(`PP : ${userid} : ${URLData.URL}`);
	});
}

module.exports = {
	name: 'pp',
	description: 'Calculates the pp of the last mentioned map',
	group: 'osu',
	options: argument.getPerformancePointsArgumentDetails(),
	example: 'https://i.imgur.com/cyZu9My.png',
	execute: execute
};