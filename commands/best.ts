'use strict';

import { IOptions, IAPIBest } from '../handlers/interfaces';
import { Client, Message, Emoji } from 'discord.js';
import * as score from '../handlers/score';

import * as error from '../handlers/error';
import * as mods from '../handlers/mods';
import * as argument from '../handlers/argument';
import * as format from '../handlers/format';
import * as gatari from '../handlers/gatari';
import * as akatsuki from '../handlers/akatsuki';

const request = require('request');
const requestPromiseNative = require('request-promise-native');

function execute(client: Client, msg: Message, args: Array<string>) {
	argument.determineUser(msg, args, (username, options) => {
		sendRequest(client, msg, username, options);
	});
}

function sendRequest(client: Client, msg: Message, user: string | undefined, options: IOptions) {
	if (options.type == 0) {
		request(`https://osu.ppy.sh/api/get_user_best?k=${process.env.osuAPI}&u=${user}&limit=100&m=${options.mode}`, {
			json: true
		}, (err: any, res: any, body: Array<IAPIBest>) => {
			sendBest(client, msg, user, body, options);
		});
	} else if (options.type == 1) {
		request(`https://api.gatari.pw/users/get?u=${user}`, {
			json: true
		}, (err: any, res: any, info: any) => {
			request(`https://api.gatari.pw/user/scores/best?id=${info.users[0].id}&l=100`, {
				json: true
			}, (err: any, res: any, body: any) => {
				sendBest(client, msg, user, gatari.best(info, body), options);
			});
		});
	} else if (options.type == 2) {
		request(`https://akatsuki.pw/api/v1/users?name=${user}`, {
			json: true
		}, (err: any, res: any, info: any) => {
			request(`https://akatsuki.pw/api/v1/users/scores/best?name=${user}&rx=${options.relax ? 1 : 0 }&l=100`, {
				json: true
			}, (err: any, res: any, body: any) => {
				sendBest(client, msg, user, akatsuki.best(info, body), options);
			});
		});
	}
}

function sendBest(client: Client, msg: Message, user: string | undefined, body: Array<IAPIBest>, options: IOptions) {
	if (body.length == 0) {
		error.log(msg, 4041);
		return;
	}

	let plays = [];
	let playString: Array<string> = [];
	let playpp: Array<number> = [];
	let urls: Array<string> = [];
	let index: Array<number> = [];
	let userPictureUrl = `https://a.ppy.sh/${body[0].user_id}?${Date.now().toString()}`;
	let userUrl = `https://osu.ppy.sh/users/${body[0].user_id}`;

	if (options.type == 1) {
		userPictureUrl = `https://a.gatari.pw/${body[0].user_id}?${Date.now().toString()}`;
		userUrl = `https://osu.gatari.pw/u/${body[0].user_id}`;
	} else if (options.type == 2) {
		userPictureUrl = `https://a.akatsuki.pw/${body[0].user_id}?${Date.now().toString()}`;
		userUrl = `https://akatsuki.pw/u/${body[0].user_id}`;
	}

	const embed: any = {
		'title': '',
		'author': {
			'url': userUrl
		},
		'description': 'No plays were found	:flushed:',
		'color': 3066993,
		'thumbnail': {
			'url': userPictureUrl
		}
	};

	for (let i = 0; i < body.length && plays.length != 5; i++) {
		if (options.mods![1] != -1) {
			if (options.mods![0]) {
				if (!mods.toString(parseInt(body[i].enabled_mods)).includes(mods.toString(options.mods![1]))) {
					continue;
				}
			} else if (options.mods![1] != parseInt(body[i].enabled_mods)) {
				continue;
			}
		}
		urls.push(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[i].beatmap_id}&a=1&m=${options.mode}`);
		index.push(i);
		plays.push(requestPromiseNative(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[i].beatmap_id}&a=1&m=${options.mode}`, {
			json: true
		}, (err: any, res: any, beatmapData: any) => {
			let j = index[urls.indexOf(res.request.href)];
			let grade = client.emojis.find((emoji: Emoji) => emoji.name === 'rank_' + body[j].rank.toLowerCase());
			let pp = Math.floor(parseFloat(body[j].pp) * 100) / 100;
			let accuracy = score.getAccuracy(options.mode!, body[j].count300, body[j].count100, body[j].count50, body[j].countmiss, body[j].countkatu, body[j].countgeki);

			playString.push(`**[- ${beatmapData[0].title} [${beatmapData[0].version}]](${`https://osu.ppy.sh/beatmapsets/${beatmapData[0].beatmapset_id}#osu/${beatmapData[0].beatmap_id}`}) +${mods.toString(parseInt(body[j].enabled_mods))}**\n| ${grade} - **${pp}pp** - ${accuracy}% - [${Math.floor(beatmapData[0].difficultyrating * 100) / 100}★]\n| (**${format.number(parseInt(body[j].maxcombo))}x${beatmapData[0].max_combo ? '**/**' + format.number(beatmapData[0].max_combo) + 'x' : ''}**) - **${format.number(parseInt(body[j].score))}** - [${body[j].count300}/${body[j].count100}/${body[j].count50}/${body[j].countmiss}]\n| Achieved: **${format.time(Date.parse(body[j].date + ' UTC'))}**\n`);
			playpp.push(pp);
		}));
	}
	Promise.all(plays).then(() => {
		let sortedpp = playpp.slice(0).sort((a, b) => {
			embed.author.name = `Here is ${user}'s top ${urls.length} osu! ${score.getRuleset(options.mode?.toString() ?? '0')} plays:`;
			return (b - a);
		});
		let sortedString = [];
		for (let i = 0; i < sortedpp.length; i++) {
			sortedString.push(playString[playpp.indexOf(sortedpp[i])]);
		}
		if (sortedpp.length != 0) {
			embed.description = sortedString.join(' ');
		}
		msg.channel.send({
			embed
		});
		console.log(`BEST : ${msg.author.id} : https://osu.ppy.sh/users/${body[0].user_id}`);
	});
}

module.exports = {
	name: 'best',
	description: 'Displays the top 5 plays of a user',
	aliases: ['top', 'bt'],
	group: 'osu',
	options: argument.getArgumentDetails(['mods','standard', 'taiko', 'catch', 'mania', 'type']),
	arguments: argument.getOtherArgumentDetails(['Username']),
	example: 'https://i.imgur.com/GkL4mJV.jpg',
	execute: execute
};