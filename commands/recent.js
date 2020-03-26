const database = require('../handlers/database');
const error = require('../handlers/error');
const format = require('../handlers/format');
const argument = require('../handlers/argument');
const request = require('request');
const {
	exec,
	execSync
} = require('child_process');
const mods = require('../handlers/mods');
const gatariData = require('./convert/gatariData');
const akatsukiData = require('./convert/akatsukiData');
const pp = require('../handlers/pp');

function recent(client, msg, args) {
	var options = argument.parse(msg, args);

	if (options.error) return;

	if (/<@![0-9]{18}>/g.test(args[0])) {
		var discordID = args[0].slice(3, 21);
		database.read('users', {
			discordID: discordID
		}, (docs, err) => {
			if (err) {
				error.log(msg, 4046);
				return;
			}
			sendRecent(client, msg, docs[0].osuUsername, options);
		});
	} else if (args.length != 0) {
		sendRecent(client, msg, args.join('_'), options);
	} else {
		database.read('users', {
			discordID: msg.author.id
		}, (docs, err) => {
			if (err) {
				error.log(msg, 4046);
				return;
			}
			options.type = docs[0].type;
			sendRecent(client, msg, docs[0].osuUsername, options);
		});
	}
}

function sendRecent(client, msg, user, options = {}) {
	if (options.type == 0) {
		if (options.mode == 0) {
			request(`https://osu.ppy.sh/api/get_user_recent?k=${process.env.osuAPI}&u=${user}&limit=${options.previous+1}`, {
				json: true
			}, (err, res, body) => {
				if (body.length == 0) {
					error.log(msg, 4044);
					return;
				}
				request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[options.previous].beatmap_id}`, {
					json: true
				}, (beatmapErr, beatmapRes, beatmapBody) => {
					if (err) console.log(err);
					body[options.previous].accuracy = Math.floor((50 * parseInt(body[options.previous].count50) + 100 * parseInt(body[options.previous].count100) + 300 * parseInt(body[options.previous].count300)) / (300 * (parseInt(body[options.previous].count50) + parseInt(body[options.previous].count100) + parseInt(body[options.previous].count300) + parseInt(body[options.previous].countmiss))) * 10000) / 100;
					pp.calculatepp(body[options.previous].beatmap_id, {
						mods: mods.toString(body[options.previous].enabled_mods, false),
						accuracy: body[options.previous].accuracy,
						combo: body[options.previous].maxcombo,
						misses: body[options.previous].countmiss,
						count100: body[options.previous].count100,
						count50: body[options.previous].count50
					}, (json) => {
						if (err) console.log(err);
						body[options.previous].pp = json.pp;
						body[options.previous].calculated_difficulty = json.stars;
						body[options.previous].max_map_combo = json.combo.split('/')[1].replace('x', '');
						body[options.previous] = {
							...body[options.previous],
							...beatmapBody[0]
						};
						generateRecent(client, msg, body[options.previous]);
					});
				});
			});
		} else {
			request(`https://osu.ppy.sh/api/get_user_recent?k=${process.env.osuAPI}&u=${user}&limit=${options.previous+1}&m=${options.mode}`, {
				json: true
			}, (err, res, body) => {
				if (body.length == 0) {
					error.log(msg, 4044);
					return;
				}
				request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[options.previous].beatmap_id}&m=${options.mode}&a=1`, {
					json: true
				}, (beatmapErr, beatmapRes, beatmapBody) => {
					if (err) console.log(err);
					body[options.previous].accuracy = Math.floor((50 * parseInt(body[options.previous].count50) + 100 * parseInt(body[options.previous].count100) + 300 * parseInt(body[options.previous].count300)) / (300 * (parseInt(body[options.previous].count50) + parseInt(body[options.previous].count100) + parseInt(body[options.previous].count300) + parseInt(body[options.previous].countmiss))) * 10000) / 100;
					body[options.previous].pp = '##';
					body[options.previous] = {
						...body[options.previous],
						...beatmapBody[0]
					};
					generateRecent(client, msg, body[options.previous]);
				});
			});
		}
	} else if (options.type == 1) {
		if (options.mode != 0) {
			msg.channel.send(':no_entry: Sorry, modes other than standard are not supported on unoffical servers yet');
			return;
		}
		request(`https://api.gatari.pw/users/get?u=${user}`, {
			json: true
		}, (err, res, bodyInfo) => {

			request(`https://api.gatari.pw/user/scores/recent?id=${bodyInfo.users[0].id}&l=${options.previous+1}&mode=${options.mode}&f=1`, {
				json: true
			}, (err, res, body) => {
				body = gatariData.recentData(body, bodyInfo, options.previous);
				pp.calculatepp(body.beatmap_id, {
					mods: mods.toString(body.enabled_mods, false),
					accuracy: body.accuracy,
					combo: body.maxcombo,
					misses: body.countmiss,
					count100: body.count100,
					count50: body.count50
				}, (json) => {
					body.pp = json.pp;
					body.calculated_difficulty = json.stars;
					body.max_map_combo = json.combo.split('/')[1].replace('x', '');
					generateRecent(client, msg, body);
				});
			});
		});
	} else if (options.type == 2) {
		if (options.mode != 0) {
			msg.channel.send(':no_entry: Sorry, modes other than standard are not supported on unoffical servers yet');
			return;
		}

		request(`https://akatsuki.pw/api/v1/users?name=${user}`, {
			json: true
		}, (err, res, bodyInfo) => {
			request(`https://akatsuki.pw/api/v1/users/scores/recent?name=${user}&rx=${options.relax}`, {
				json: true
			}, (err, res, body) => {
				body = akatsukiData.recentData(body, bodyInfo, options.previous);
				pp.calculatepp(body.beatmap_id, {
					mods: mods.toString(body.enabled_mods, false),
					accuracy: body.accuracy,
					combo: body.maxcombo,
					misses: body.countmiss,
					count100: body.count100,
					count50: body.count50
				}, (json) => {
					body.pp = json.pp;
					body.calculated_difficulty = json.stars;
					body.max_map_combo = json.combo.split('/')[1].replace('x', '');
					generateRecent(client, msg, body);
				});
			});
		});
	}


}

function generateRecent(client, msg, body) {

	if (body.length == 0) {
		error.log(msg, 4044);
		return;
	}
	var userPictureUrl = `https://a.ppy.sh/${body.user_id}?${Date.now().toString()}`;
	if (body.type == 1) {
		userPictureUrl = `https://a.gatari.pw/${body.user_id}?${Date.now().toString()}`;
	} else if (body.type == 2) {
		userPictureUrl = `https://a.akatsuki.pw/${body.user_id}?${Date.now().toString()}`;
	}

	let grade = client.emojis.find(emoji => emoji.name === 'grade_' + body.rank.toLowerCase());
	let status = client.emojis.find(emoji => emoji.name === 'status_' + body.approved);
	let date = format.time(Date.parse(body.date));

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

	var completion = 0;
	if (body.rank.toLowerCase() == 'f') {
		completion = Math.floor((parseInt(body.count50) + parseInt(body.count100) + parseInt(body.count300) + parseInt(body.countmiss)) / parseInt(body.max_map_combo) * 10000) / 100;
	}

	if (!selectedMods.includes('DT') && !selectedMods.includes('HR') && !selectedMods.includes('EZ') && !selectedMods.includes('HT') && !selectedMods.includes('NC')) {
		body.calculated_difficulty = Math.floor(body.difficultyrating * 100) / 100;
	}
	var ppFC = '-';
	if (body.mode == 0) {
		ppFC = pp.calculatepp(body.beatmap_id, {
			mods: mods.toString(body.enabled_mods, false),
			accuracy: (body.accuracy >= 80 ? body.accuracy : 80),
			count100: body.count100,
			count50: body.count50,
			sync: true
		});
		ppFC = body.perfect == 1 ? '' : '(FC: ' + parseInt(ppFC.pp) + 'pp)';
		console.log(ppFC)
	}

	const embed = {
		'description': `| ${status} - ${grade} - **${body.pp}pp** - ${body.accuracy}% ${ppFC} ${body.perfect == 1 ? ' - __**[Full Combo!]**__' : ''}\n| ${'★'.repeat(Math.floor(body.difficultyrating))} **[${Math.floor(body.difficultyrating * 100)/100}★]${body.calculated_difficulty != Math.floor(body.difficultyrating * 100)/100 && body.mode == 0 ? ` (${body.calculated_difficulty}★ with Mods)` : ''}**\n| (**${format.number(body.maxcombo)}x${body.max_combo ? '**/**'+format.number(body.max_combo)+'x' : ''}**) - ${format.number(body.score)} - [${body.count300}/${body.count100}/${body.count50}/${body.countmiss}]\n| ${body.rank.toLowerCase() == 'f' && body.max_map_combo ? `Completed: **${completion}%**  - ` :''}Achieved: **${date}**${(body.replay_available == 1 ? `\n| [${client.emojis.find(emoji => emoji.name === 'icon_3_'+(body.rank).toLowerCase().replace('xh','x').replace('d','f'))} Replay is Available](https://osu.ppy.sh/scores/osu/${body.score_id}/download)` : '')}\n| ${client.emojis.find(emoji => emoji.name === 'icon_0_'+(body.rank).toLowerCase().replace('xh','x').replace('d','f'))} [Direct](https://the-beautiful-bot-api.herokuapp.com/s/${body.beatmapset_id}) ${client.emojis.find(emoji => emoji.name === 'icon_1_'+(body.rank).toLowerCase().replace('xh','x').replace('d','f'))} [Bloodcat](https://bloodcat.com/osu/s/${body.beatmapset_id}) ${client.emojis.find(emoji => emoji.name === 'icon_2_'+(body.rank).toLowerCase().replace('xh','x').replace('d','f'))} [TBB Stats](https://the-beautiful-bot.netlify.com/beatmap?bsetid=${body.beatmapset_id})`,
		'url': 'https://discordapp.com',
		'color': colour,
		'image': {
			'url': `https://assets.ppy.sh/beatmaps/${body.beatmapset_id}/covers/cover.jpg`
		},
		'author': {
			'name': `${body.title} [${body.version}] +${selectedMods}`,
			'url': `https://osu.ppy.sh/beatmapsets/${body.beatmapset_id}#osu/${body.beatmap_id}`,
			'icon_url': userPictureUrl
		}
	};
	msg.channel.send({
		embed
	});
	console.log(`RECENT : ${msg.author.id} : https://osu.ppy.sh/users/${body.user_id}`);

}


module.exports = {
	recent: recent,
	generateRecent: generateRecent
};