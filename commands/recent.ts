'use strict';

import { Client, Message } from 'discord.js';
import { IOptions } from '../handlers/interfaces';

import * as error from '../handlers/error';
import * as format from '../handlers/format';
import * as argument from '../handlers/argument';
import * as mods from '../handlers/mods';
import * as pp from '../handlers/pp';
import * as gatari from '../handlers/gatari';
import * as akatsuki from '../handlers/akatsuki';
import * as score from '../handlers/score';

const request = require('request');

function execute(client: Client, msg: Message, args: Array<string>) {
	argument.determineUser(msg, args, (user, options) => {
		sendRecent(client, msg, user, options);
	});
}

function sendRecent(client: Client, msg: Message, user: string | undefined, options: IOptions) {
	if (options.type == 0) {
		request(`https://osu.ppy.sh/api/get_user_recent?k=${process.env.osuAPI}&u=${user}&limit=${options.previous! + 1}&m=${options.mode}`, {
			json: true
		}, (err: any, res: any, body: any) => {
			if (body.length == 0 || body.length < options.previous! + 1) {
				error.log(msg, 4044);
				return;
			}
			processData(client, msg, body[options.previous!], options);
		});
	} else if (options.type == 1) {
		if (options.mode != 0) {
			msg.channel.send(':no_entry: Sorry, modes other than standard are not supported on unoffical servers yet');
			return;
		}
		request(`https://api.gatari.pw/users/get?u=${user}`, {
			json: true
		}, (err: any, res: any, bodyInfo: any) => {

			if (bodyInfo.users.length == 0) {
				error.log(msg, 4041);
				return;
			}

			request(`https://api.gatari.pw/user/scores/recent?id=${bodyInfo.users[0].id}&l=${options.previous! + 1}&mode=${options.mode}&f=1`, {
				json: true
			}, (err: any, res: any, body: any) => {
				body = gatari.recent(bodyInfo, body, options.previous!);
				processData(client, msg, body, options);

			});
		});
	} else if (options.type == 2) {
		if (options.mode != 0) {
			msg.channel.send(':no_entry: Sorry, modes other than standard are not supported on unoffical servers yet');
			return;
		}

		request(`https://akatsuki.pw/api/v1/users?name=${user}`, {
			json: true
		}, (err: any, res: any, bodyInfo: any) => {

			if (bodyInfo.code == 404) {
				error.log(msg, 4041);
				return;
			}

			request(`https://akatsuki.pw/api/v1/users/scores/recent?name=${user}&rx=${options.relax ? 1 : 0}`, {
				json: true
			}, (err: any, res: any, body: any) => {
				body = akatsuki.recent(bodyInfo, body, options.previous!);
				processData(client, msg, body, options);
			});
		});
	}
}

function processData(client: Client, msg: Message, object: any, options: IOptions) {

	// Will be reimplemented soon

	// let modsString = mods.toString(object.enabled_mods);
	// let enabled_mods = 0;
	// if (modsString.includes('DT') || modsString.includes('NC')) enabled_mods += 64;
	// if (modsString.includes('HT')) enabled_mods += 256;
	// if (modsString.includes('HR')) enabled_mods += 16;
	// if (modsString.includes('EZ')) enabled_mods += 2;

	request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&${object.beatmapMD5 ? `h=${object.beatmapMD5}` : `b=${object.beatmap_id}`}&m=${options.mode}&a=1`, {
		json: true
	}, (err: any, res: any, body: any) => {
		if (body.length == 0) {
			msg.channel.send(':red_circle: The beatmap could not be found');
			return;
		}

		object = {
			...object,
			...body[0]
		};

		object.options = options;
		object.accuracy = score.getAccuracy(options.mode!, object.count300, object.count100, object.count50, object.countmiss, object.countkatu, object.countgeki);

		var outputObject;
		if (options.mode == 0) {
			pp.calculatepp(object.beatmap_id, {
				mods: parseInt(object.enabled_mods),
				accuracy: object.accuracy,
				combo: parseInt(object.maxcombo),
				misses: parseInt(object.countmiss),
				mode: options.mode
			}, (json) => {
				object.pp = object.pp || json.pp;
				object.calculated_difficulty = json.stars;
				object.totalHits = json.totalHits;
				object.ppFC = json.ppFC;
				generateRecent(client, msg, object);
			});
		} else if (options.mode == 1) {
			object.pp = '-';
			generateRecent(client, msg, object);
		} else if (options.mode == 2) {
			object.diff_approach *= 1.5;
			outputObject = pp.calculateCatchpp(object);
			object.totalHits = object.max_combo;
			object.pp = outputObject.pp;
			generateRecent(client, msg, object);
		} else if (options.mode == 3) {
			outputObject = pp.calculateManiapp(object);
			object.pp = outputObject.pp;
			generateRecent(client, msg, object);
		}
	});
}

function generateRecent(client: Client, msg: Message, body: any) {
	if (body.length == 0) {
		error.log(msg, 4044);
		return;
	}

	var userPictureUrl = `https://a.ppy.sh/${body.user_id}?${Date.now().toString()}`;
	if (body.options.type == 1) {
		userPictureUrl = `https://a.gatari.pw/${body.user_id}?${Date.now().toString()}`;
	} else if (body.options.type == 2) {
		userPictureUrl = `https://a.akatsuki.pw/${body.user_id}?${Date.now().toString()}`;
	}

	let grade = client.emojis.find(emoji => emoji.name === 'rank_' + body.rank.toLowerCase());
	let status = client.emojis.find(emoji => emoji.name === 'status_' + body.approved);
	let date = format.time(new Date(body.date + ' UTC').getTime());
	body.difficultyrating = Math.round(body.difficultyrating * 100) / 100;
	let selectedMods = mods.toString(body.enabled_mods);
	var colour = 0;
	if (body.rank.toLowerCase() == 'f' || body.rank.toLowerCase() == 'd') colour = 15158332;
	else if (body.rank.toLowerCase() == 'c') colour = 10181046;
	else if (body.rank.toLowerCase() == 'b') colour = 3447003;
	else if (body.rank.toLowerCase() == 'a') colour = 3066993;
	else if (body.rank.toLowerCase() == 's') colour = 15844367;
	else if (body.rank.toLowerCase() == 'sh') colour = 12370112;
	else if (body.rank.toLowerCase() == 'x') colour = 16580705;
	else if (body.rank.toLowerCase() == 'xh') colour = 16580705;

	// if (!isNaN(body.pp)) body.pp = Math.floor(body.pp * 100)/100;

	var completion = 0;
	if (body.rank.toLowerCase() == 'f') {
		completion = Math.floor((parseInt(body.count50) + parseInt(body.count100) + parseInt(body.count300) + parseInt(body.countmiss)) / parseInt(body.totalHits) * 10000) / 100;
	}

	var withMods = false;
	if (selectedMods.includes('DT') || selectedMods.includes('HR') || selectedMods.includes('EZ') || selectedMods.includes('HT') || selectedMods.includes('NC')) {
		withMods = true;
	}
	var ppFC = '';
	if (body.ppFC) {
		ppFC = body.perfect == 1 ? '' : '(FC: ' + parseInt(body.ppFC) + 'pp)';
	}

	if (body.options.mode == 0) body.modeName = 'osu!';
	if (body.options.mode == 1) body.modeName = 'Taiko';
	if (body.options.mode == 2) body.modeName = 'Catch';
	if (body.options.mode == 3) body.modeName = 'Mania';
	const embed = {
		'description': `| ${status} - ${grade} - **${body.pp}pp** - ${body.accuracy}% ${ppFC} ${body.perfect == 1 ? ' - __**[Full Combo!]**__' : ''}\n| ${'★'.repeat(Math.round(body.difficultyrating))} **[${body.difficultyrating}★]${withMods && body.options.mode == 0 ? ` (${body.calculated_difficulty}★ with Mods)` : ''}**\n| (**${format.number(body.maxcombo)}x${body.max_combo ? '**/**' + format.number(body.max_combo) + 'x' : ''}**) - ${format.number(body.score)} - [${body.count300}/${body.count100}/${body.count50}/${body.countmiss}]\n| ${body.rank.toLowerCase() == 'f' && body.max_combo ? `Completed: **${completion}%**  - ` : ''}Achieved: **${date}**${(body.replay_available == 1 ? `\n| [${client.emojis.find(emoji => emoji.name === 'icon_3_' + (body.rank).toLowerCase().replace('xh', 'x').replace('d', 'f'))} Replay is Available](https://osu.ppy.sh/scores/osu/${body.score_id}/download)` : '')}\n| ${client.emojis.find(emoji => emoji.name === 'icon_0_' + (body.rank).toLowerCase().replace('xh', 'x').replace('d', 'f'))} [Direct](https://the-beautiful-bot-api.herokuapp.com/s/${body.beatmapset_id}) ${client.emojis.find(emoji => emoji.name === 'icon_1_' + (body.rank).toLowerCase().replace('xh', 'x').replace('d', 'f'))} [Bloodcat](https://bloodcat.com/osu/s/${body.beatmapset_id}) ${client.emojis.find(emoji => emoji.name === 'icon_2_' + (body.rank).toLowerCase().replace('xh', 'x').replace('d', 'f'))} [TBB Stats](https://the-beautiful-bot.netlify.com/beatmap?bsetid=${body.beatmapset_id})`,
		'url': 'https://discordapp.com',
		'color': colour,
		'image': {
			'url': `https://assets.ppy.sh/beatmaps/${body.beatmapset_id}/covers/cover.jpg`
		},
		'author': {
			'name': `(${body.modeName}) ${body.title} [${body.version}] +${selectedMods}`,
			'url': `https://osu.ppy.sh/beatmapsets/${body.beatmapset_id}#osu/${body.beatmap_id}`,
			'icon_url': userPictureUrl
		}
	};
	msg.channel.send({
		embed
	});
	console.log(`RECENT : ${msg.author.id} : https://osu.ppy.sh/users/${body.user_id || body.username}`);

}


module.exports = {
	name: 'recent',
	description: 'Displays your recent play',
	aliases: ['rs'],
	group: 'osu',
	options: argument.getArgumentDetails(['previous', 'standard', 'taiko', 'catch', 'mania', 'type', 'relax']),
	arguments: argument.getOtherArgumentDetails(['Username']),
	execute: execute,
	generateRecent: generateRecent,
	processData: processData
};