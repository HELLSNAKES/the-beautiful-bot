import { Client, Message } from 'discord.js';
import { IOptions } from '../handlers/interfaces';

import * as error from '../handlers/error';
import * as format from '../handlers/format';
import * as argument from '../handlers/argument';
import * as mods from '../handlers/mods';
import * as pp from '../handlers/pp';
import * as score from '../handlers/score';
import * as utility from '../handlers/utility';
import * as API from '../handlers/API';

function execute(client: Client, msg: Message, args: Array<string>) {
	argument.determineUser(msg, args, (user, options) => {
		sendRecent(client, msg, user, options);
	});
}

function sendRecent(client: Client, msg: Message, user: string | undefined, options: IOptions) {
	utility.checkUser(user!, options.type)
		.then((userID) => {
			API.getRecent(userID, options.mode, options.type, options.relax)
				.then((res) => {
					if (options.passesonly) {
						res = res.filter((x: any) => x.rank != 'F');
					}
					
					if (res.length == 0) {
						msg.channel.send(`:red_circle: **\`${user}\` does not have any recent plays**\nNo submitted plays were achieved in the past 24 hours by \`${user}\` on osu! \`${score.getRuleset(String(options.mode))}\`.`);
						return;
					}

					if (res.length < options.previous! + 1) {
						msg.channel.send(`:red_circle: **Play index out of range for the username \`${user}\`**\nThe user only has \`${res.length - 1}\` plays that were achieved within the past 24 hours. \`${options.previous}\` is outside of that range`);
						return;
					}

					processData(client, msg, res[options.previous!], options);

				}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });
		}).catch((err: Error) => {
			if (err.message == 'No user with the specified username/user id was found') {
				msg.channel.send(`:red_circle: **The username \`${user}\` is not valid**\nThe username used or linked does not exist on the \`${score.getServer(String(options.type))}\` servers. Try using the id of the user instead of the username`);
			} else {
				error.sendUnexpectedError(err, msg);
			}
		});
}

function processData(client: Client, msg: Message, object: any, options: IOptions) {

	let modsString = mods.toString(object.enabled_mods);
	let enabled_mods = 0;
	if (modsString.includes('DT') || modsString.includes('NC')) enabled_mods += 64;
	if (modsString.includes('HT')) enabled_mods += 256;
	if (modsString.includes('HR')) enabled_mods += 16;
	if (modsString.includes('EZ')) enabled_mods += 2;

	API.getBeatmap({
		hash: object.beatmapMD5,
		beatmapID: object.beatmap_id,
		ruleset: options.mode,
		converted: true,
		mods: options.mode != 0 ? enabled_mods : 0
	}).then((res: any) => {
		if (res.length == 0) {
			msg.channel.send(':red_circle: **The beatmap is could not be found**\nFor some unknown reason the beatmap could not be found. This has been automatically reported and will be resolved asap');
			error.unexpectedError(new Error('Beatmap could not be found'), 'GET request response:\n' + JSON.stringify(res));
			return;
		}

		object = {
			...object,
			...res[0]
		};

		object.options = options;
		object.accuracy = score.getAccuracy(options.mode!, object.count300, object.count100, object.count50, object.countmiss, object.countkatu, object.countgeki);
		object.totalHits = parseInt(object.count_normal) + parseInt(object.count_slider) + parseInt(object.count_spinner);

		var outputObject;

		if (options.mode == 0) {
			pp.calculatepp(object.beatmap_id, {
				mods: parseInt(object.enabled_mods),
				accuracy: object.accuracy,
				combo: parseInt(object.maxcombo),
				misses: parseInt(object.countmiss),
				mode: options.mode,
				ppv3: options.ppv3
			}, (json) => {
				object.pp = object.pp || json.pp;
				object.calculated_difficulty = json.stars;
				object.ppFC = json.ppFC;
				generateRecent(client, msg, object);
			});
		} else if (options.mode == 1) {
			outputObject = pp.calculateTaikopp(object);
			object.accuracy = outputObject.accuracy;
			object.pp = Math.round(outputObject.pp * 100) / 100;
			generateRecent(client, msg, object);
		} else if (options.mode == 2) {
			outputObject = pp.calculateCatchpp(object);
			object.pp = outputObject.pp;
			generateRecent(client, msg, object);
		} else if (options.mode == 3) {
			outputObject = pp.calculateManiapp(object);
			object.pp = outputObject.pp;
			generateRecent(client, msg, object);
		}
	}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });
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

	if (body.approved < 1) body.approved = 0;

	let grade = client.emojis.find(emoji => emoji.name === 'rank_' + body.rank.toLowerCase());
	let status = client.emojis.find(emoji => emoji.name === 'status_' + body.approved);
	let date = format.time(new Date(body.date + (body.options.type == 0 ? ' UTC' : '')).getTime());
	body.difficultyrating = Math.round(body.difficultyrating * 100) / 100;
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
		var objects = parseInt(body.countmiss) + parseInt(body.count50) + parseInt(body.count100) + parseInt(body.count300);

		if (body.options.mode == 1) {
			objects = parseInt(body.countmiss) + parseInt(body.count100) + parseInt(body.count300);

		} else if (body.options.mode == 2) {
			objects = parseInt(body.countmiss) + parseInt(body.count100) + parseInt(body.countkatu) + parseInt(body.count300);

		} else if (body.options.mode == 3) {
			objects = parseInt(body.countmiss) + parseInt(body.count50) + parseInt(body.count100) + parseInt(body.countkatu) + parseInt(body.count300) + parseInt(body.countgeki);

		}

		completion = (Math.floor(((objects / body.totalHits) - 0.0000000001) * 10000) / 100);
	}

	var withMods = false;
	if (mods.has(body.enabled_mods, 'DT') || mods.has(body.enabled_mods, 'HR')
		|| mods.has(body.enabled_mods, 'EZ') || mods.has(body.enabled_mods, 'HT')) {
		withMods = true;
	}
	var ppFC = '';
	if (body.ppFC) {
		ppFC = body.perfect == 1 ? '' : '• (FC: ' + parseInt(body.ppFC) + 'pp)';
	}

	var scoreValues = `[${body.count300}/${body.count100}/${body.count50}/${body.countmiss}]`;
	if (body.options.mode == 1) scoreValues = `[${body.count300}/${body.count100}/${body.countmiss}]`;
	else if (body.options.mode == 2) scoreValues = `[${body.count300}/${body.count100}/${body.countkatu}/${body.countmiss}]`;
	else if (body.options.mode == 3) scoreValues = `[${body.countgeki}/${body.count300}/${body.countkatu}/${body.count100}/${body.count50}/${body.countmiss}]`;

	if (body.options.mode == 0) body.modeName = 'osu!';
	if (body.options.mode == 1) body.modeName = 'Taiko';
	if (body.options.mode == 2) body.modeName = 'Catch';
	if (body.options.mode == 3) body.modeName = 'Mania';
	const embed = {
		'description': `| ${status} • ${grade} • **${body.pp}pp** • ${body.accuracy}% ${ppFC} ${body.perfect == 1 ? ' • __**[Full Combo!]**__' : ''}\n| ${'★'.repeat(Math.min(Math.round(body.difficultyrating),10))} **[${body.difficultyrating}★]${withMods && body.options.mode == 0 ? ` (${body.calculated_difficulty}★ with Mods)` : ''}**\n| (**${format.number(body.maxcombo)}x${body.max_combo ? '**/**' + format.number(body.max_combo) + 'x' : ''}**) • ${format.number(body.score)} • ${scoreValues}${body.rank.toLowerCase() == 'f' || body.date ? '\n|' : ''} ${body.rank.toLowerCase() == 'f' ? `Completed: **${completion}%**  • ` : ''}${body.date ? `Achieved: **${date}**` : ''}${(body.replay_available == 1 ? `\n| [${client.emojis.find(emoji => emoji.name === 'icon_3_' + (body.rank).toLowerCase().replace('xh', 'x').replace('d', 'f'))} Replay is Available](https://osu.ppy.sh/scores/osu/${body.score_id}/download)` : '')}\n| ${client.emojis.find(emoji => emoji.name === 'icon_0_' + (body.rank).toLowerCase().replace('xh', 'x').replace('d', 'f'))} [Direct](https://the-beautiful-bot-api.herokuapp.com/s/${body.beatmapset_id}) ${client.emojis.find(emoji => emoji.name === 'icon_1_' + (body.rank).toLowerCase().replace('xh', 'x').replace('d', 'f'))} [Bloodcat](https://bloodcat.com/osu/s/${body.beatmapset_id}) ${client.emojis.find(emoji => emoji.name === 'icon_2_' + (body.rank).toLowerCase().replace('xh', 'x').replace('d', 'f'))} [TBB Stats](https://the-beautiful-bot.netlify.com/beatmap?bsetid=${body.beatmapset_id})`,
		'url': 'https://discordapp.com',
		'color': colour,
		'image': {
			'url': `https://assets.ppy.sh/beatmaps/${body.beatmapset_id}/covers/cover.jpg`
		},
		'author': {
			'name': `(${body.modeName}) ${body.title} [${body.version}] +${mods.toString(body.enabled_mods)}`,
			'url': `https://osu.ppy.sh/beatmapsets/${body.beatmapset_id}#osu/${body.beatmap_id}`,
			'icon_url': userPictureUrl
		}
	};
	msg.channel.send({
		embed
	});

	if (body.otherComparePlays != undefined && body.otherComparePlays.length > 0) {
		var otherPlaysString = 'A';

		for (var i = 0; i < body.otherComparePlays.length; i++) {
			otherPlaysString += ` \`${mods.toString(body.otherComparePlays[i]).replace('No Mod', 'NM')}\``;
			if (i < body.otherComparePlays.length - 2) otherPlaysString += ',';
			else if (i == body.otherComparePlays.length - 2) otherPlaysString += ' and';
			else otherPlaysString += ' ';
		}

		if (i < 2) otherPlaysString += 'play is available';
		else otherPlaysString += 'plays are available';

		otherPlaysString += '\nUse `$compare -mods [Mod combination]` to view the specificed play';

		msg.channel.send(otherPlaysString);
	}

	console.log(`RECENT : ${msg.author.id} : https://osu.ppy.sh/users/${body.user_id || body.username}`);

}


module.exports = {
	name: 'recent',
	description: 'Displays your recent play',
	aliases: ['rs'],
	group: 'osu',
	options: argument.getArgumentDetails(['previous', 'standard', 'taiko', 'catch', 'mania', 'type', 'relax', 'passesonly','ppv3']),
	arguments: argument.getOtherArgumentDetails(['Username']),
	example: 'https://i.imgur.com/2nTxN2O.png',
	execute: execute,
	generateRecent: generateRecent,
	processData: processData
};