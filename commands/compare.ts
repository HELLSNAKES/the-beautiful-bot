'use strict';

import { Client, Message } from 'discord.js';
import { IOptions, IURLParserBeatmap } from '../handlers/interfaces';

import * as argument from '../handlers/argument';
import * as getMaps from '../handlers/getMap';
import * as error from '../handlers/error';
import * as mods from '../handlers/mods';

const axios = require('axios');
const recent = require('./recent');

function execute(client: Client, msg: Message, args: Array<string>) {
	getMaps.getMaps(client, msg, function (client, msg, URLData) {
		argument.determineUser(msg, args, (username, options) => {
			options.mode = URLData.ruleset;
			sendCompareEmbed(client, msg, URLData, username, options);
		});
	});
}

function sendCompareEmbed(client: Client, msg: Message, URLData: IURLParserBeatmap, username: string | undefined, options: IOptions) {
	if (options.type == 0) {
		axios.get(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&u=${username}&b=${URLData.beatmapID}&m=${options.mode}`)
			.then((res: any) => {

				axios.get(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${URLData.beatmapID}&a=1&m=${options.mode}`)
					.then((resBeatmap : any) => {

						if (res.data.length == 0) {
							msg.channel.send(`:yellow_circle: **\`${username}\` does not have any submitted scores on \`${resBeatmap.data[0].artist} - ${resBeatmap.data[0].title} [${resBeatmap.data[0].version}]\`**`);
							return;
						}
				
						var index = 0;

						if (options!.mods != undefined) {
							for (var i = 0; i < res.data.length; i++) {
								if (mods.toString(res.data[i].enabled_mods) == options!.mods![1]) {
									index = i;
									break;
								}
							}
						}
				
						res.data[index].otherComparePlays = res.data.filter((x : any) => x.enabled_mods != res.data[index].enabled_mods).map((x : any) => x.enabled_mods);

						res.data = {
							...res.data[index],
							...resBeatmap.data[0]
						};
						
						res.data.pp = Math.floor(res.data.pp * 100) / 100;

						options.mode = res.data.mode;

						recent.processData(client, msg, res.data, options);
						console.log(`COMPARE : ${msg.author.id} : https://osu.ppy.sh/users/${res.data.user_id}`);
					}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});
			}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});
	} else {
		msg.channel.send(':no_entry: Sorry but private servers are not supported on $compare/$c yet');
	}
}

module.exports = {
	name: 'compare',
	description: 'Compares your play/specified play with the last mentioned play',
	aliases: ['c'],
	group: 'osu',
	arguments: argument.getOtherArgumentDetails(['Username']),
	example: 'https://i.imgur.com/GkL4mJV.jpg',
	execute: execute
};