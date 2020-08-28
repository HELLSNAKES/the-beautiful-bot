import { IOptions, IAPIBest } from '../handlers/interfaces';
import { Client, Message, Emoji } from 'discord.js';
import * as score from '../handlers/score';

import * as mods from '../handlers/mods';
import * as argument from '../handlers/argument';
import * as format from '../handlers/format';
import * as error from '../handlers/error';
import * as utility from '../handlers/utility';
import * as API from '../handlers/API';

function execute(client: Client, msg: Message, args: Array<string>) {
	argument.determineUser(msg, args, (username, options) => {
		sendRequest(client, msg, username, options);
	});
}

function sendRequest(client: Client, msg: Message, user: string | undefined, options: IOptions) {
	utility.checkUser(user!, options.type)
		.then((userID) => {
			API.getBest(userID, options.mode, options.type, options.relax)
				.then((res) => {
					sendBest(client, msg, user, res, options);
				}).catch((err: Error) => { error.sendUnexpectedError(err, msg);});
		}).catch((err: Error) => {
			console.log(err.name);
			if (err.message == 'No user with the specified username/user id was found') {
				msg.channel.send(`:red_circle: **The username \`${user}\` is not valid**\nThe username used or linked does not exist on the \`${score.getServer(String(options.type))}\` servers. Try using the id of the user instead of the username`);
			} else {
				error.sendUnexpectedError(err, msg);
			}
		});
}

function sendBest(client: Client, msg: Message, user: string | undefined, body: Array<IAPIBest>, options: IOptions) {
	let scores: any = [];
	let beatmaps: any = [];

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

	for (let i = 0; i < body.length && scores.length != 5; i++) {
		if (options.mods![1] != '-1') {
			if (options.mods![0]) {
				if (!mods.has(body[i].enabled_mods, options.mods![1])) {
					continue;
				}
			} else if (options.mods![1] != mods.toString(parseInt(body[i].enabled_mods))) {
				continue;
			}
		}
		
		var difficultyIncreasingMods = 0;
		if (mods.has(body[i].enabled_mods, 'EZ')) difficultyIncreasingMods += 2;
		if (mods.has(body[i].enabled_mods, 'HR')) difficultyIncreasingMods += 16;
		if (mods.has(body[i].enabled_mods, 'DT')) difficultyIncreasingMods += 64;
		if (mods.has(body[i].enabled_mods, 'HT')) difficultyIncreasingMods += 256;

		scores.push(body[i]);
		beatmaps.push(API.getBeatmap({
			beatmapID: body[i].beatmap_id,
			converted: true,
			ruleset: options.mode ?? 0,
			mods: difficultyIncreasingMods,
		}));
	}

	Promise.all(beatmaps).then((values: Array<any>) => {
		const scoresToString: Array<string> = [];

		
		scores.map((x: any, i: number) => {
			var scoreValues = `[${x.count300}/${x.count100}/${x.count50}/${x.countmiss}]`;
			if (options.mode == 1) scoreValues = `[${x.count300}/${x.count100}/${x.countmiss}]`;
			else if (options.mode == 2) scoreValues = `[${x.count300}/${x.count100}/${x.countkatu}/${x.countmiss}]`;
			else if (options.mode == 3) scoreValues = `[${x.countgeki}/${x.count300}/${x.countkatu}/${x.count100}/${x.count50}/${x.countmiss}]`;
			
			const grade = client.emojis.find((emoji: Emoji) => emoji.name === 'rank_' + x.rank.toLowerCase());
			const pp = Math.floor(parseFloat(x.pp) * 100) / 100;
			const accuracy = score.getAccuracy(options.mode!, x.count300, x.count100, x.count50, x.countmiss, x.countkatu, x.countgeki);
			scoresToString.push(`**[${values[i][0].title} [${values[i][0].version}]](${`https://osu.ppy.sh/beatmapsets/${values[i][0].beatmapset_id}#osu/${values[i][0].beatmap_id}`}) +${mods.toString(parseInt(x.enabled_mods))}**\n| ${grade} • **${pp}pp** • ${accuracy}% • [${Math.round(values[i][0].difficultyrating * 100) / 100}★]\n| (**${format.number(parseInt(x.maxcombo))}x${values[i][0].max_combo ? '**/**' + format.number(values[i][0].max_combo) + 'x' : ''}**) • **${format.number(parseInt(x.score))}** • ${scoreValues}\n| Achieved: **${format.time(Date.parse(x.date + (options.type == 0 ? ' UTC' : '')))}**\n`);
		});

		embed.author.name = `Here is ${user}'s top ${scores.length} osu! ${score.getRuleset(options.mode?.toString() ?? '0')} plays:`;
		embed.description = scoresToString.join(' ');

		msg.channel.send({
			embed
		});
		console.log(`BEST : ${msg.author.id} : https://osu.ppy.sh/users/${body[0].user_id}`);
	}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });
}

module.exports = {
	name: 'best',
	description: 'Displays the top 5 plays of a user',
	aliases: ['top', 'bt'],
	group: 'osu',
	options: argument.getArgumentDetails(['mods', 'standard', 'taiko', 'catch', 'mania', 'type']),
	arguments: argument.getOtherArgumentDetails(['Username']),
	example: 'https://i.imgur.com/MNnWWxO.png',
	execute: execute
};