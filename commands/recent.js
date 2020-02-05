const database = require('../handlers/database');
const error = require('../handlers/error');
const format = require('../handlers/format');
const request = require('request');
const {
	exec,
	execSync
} = require('child_process');
const mods = require('../handlers/mods');

function recent(client, msg, args) {
	var options = {};
	for (var i = 0; i < args.length; i++) {
		if (args[i] == '-p') {
			options.previous = parseInt(args[i + 1]);
			args.splice(i, 2);
		} else if (args[i] == '-m') {
			options.mode = parseInt(args[i + 1]);
			args.splice(i, 2);
		} else if (args[i] == '-t') {
			options.type = parseInt(args[i + 1]);
			args.splice(i, 2);
		}
	}
	if (/<@![0-9]{18}>/g.test(args[0])) {
		var discordID = args[0].slice(3, 21);
		database.read({
			discordID: discordID
		}, (doc) => {
			if (doc.error) {
				error.log(msg, 4046);
				return;
			}
			sendRecent(client, msg, doc.osuUsername, options);
		});
	} else if (args.length != 0) {
		sendRecent(client, msg, args.join('_'), options);
	} else {
		database.read({
			discordID: msg.author.id
		}, (doc) => {
			sendRecent(client, msg, doc.osuUsername, options);
		});
	}
}

function sendRecent(client, msg, user, options = {}) {

	options.previous = (typeof options.previous !== 'undefined') ? options.previous : 0;
	options.mode = (typeof options.mode !== 'undefined') ? options.mode : 0;
	if (0 > options.previous || options.previous > 49 || isNaN(options.previous)) {
		error.log(msg, 4045);
		return;
	}

	if (0 > options.mode || options.mode > 4 || isNaN(options.mode)) {
		error.log(msg, 4045);
		return;
	}

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
				exec(`curl -s https://osu.ppy.sh/osu/${body[options.previous].beatmap_id} | node handlers/pp.js +${mods.toString(body[options.previous].enabled_mods)} ${body[options.previous].accuracy}% ${body[options.previous].maxcombo}x ${body[options.previous].countmiss}m`, (err, stdout, stderr) => {
					if (err) console.log(err);
					var ojsama = stdout.replace('\n', '').split('$');
					body[options.previous].pp = ojsama[0];
					body[options.previous].calculated_difficulty = ojsama[1];
					body[options.previous].max_map_combo = ojsama[2];
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
			request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[options.previous].beatmap_id}&m=${options.mode}`, {
				json: true
			}, (beatmapErr, beatmapRes, beatmapBody) => {
				if (err) console.log(err);
				body[options.previous].accuracy = Math.floor((50 * parseInt(body[options.previous].count50) + 100 * parseInt(body[options.previous].count100) + 300 * parseInt(body[options.previous].count300)) / (300 * (parseInt(body[options.previous].count50) + parseInt(body[options.previous].count100) + parseInt(body[options.previous].count300) + parseInt(body[options.previous].countmiss))) * 10000) / 100;
				body[options.previous].pp = '##';
				body[options.previous] = {
					...body[options.previous],
					...beatmapBody[0]
				};
				console.log(body[options.previous]);
				generateRecent(client, msg, body[options.previous]);
			});
		});
	}
	} else if (type == 1) {
		request(``, {json:true},() => {
			request(`https://api.gatari.pw/user/scores/recent?id=${}&l=${option.previous+1}&mode=${options.mode}&f=1`, {json: true}, () => {
				
			})
		})
	}


}

function generateRecent(client, msg, body) {
	if (body.length == 0) {
		error.log(msg, 4044);
		return;
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
		ppFC = body.perfect == 0 ? '(' + (body.accuracy >= 80 ? body.accuracy : 80) + '% ' + parseInt(execSync(`curl -s https://osu.ppy.sh/osu/${body.beatmap_id} | node handlers/pp.js ${(body.accuracy >= 80 ? body.accuracy : 80)}% +${mods.toString(body.enabled_mods)}`)).toString().split('$')[0] + 'pp)' : '';
	}
	const embed = {
		'description': `${status} - ${grade} - **${body.pp}pp** - ${body.accuracy}% ${ppFC} ${body.perfect == 1 ? ' - __**[Full Combo!]**__' : ''}\n${'★'.repeat(Math.floor(body.difficultyrating))} **[${Math.floor(body.difficultyrating * 100)/100}★]${body.calculated_difficulty != Math.floor(body.difficultyrating * 100)/100 && body.mode == 0 ? ` (${body.calculated_difficulty}★ with Mods)` : ''}**\nCombo: **${format.number(body.maxcombo)}x${body.max_combo ? '/'+format.number(body.max_combo)+'x' : ''}**	Score: **${format.number(body.score)}**\n[${body.count300}/${body.count100}/${body.count50}/${body.countmiss}]${body.rank.toLowerCase() == 'f' && body.max_map_combo ? `\nCompleted: **${completion}%**` :''}\nAchieved: **${date}**\n[Supporter](https://the-beautiful-bot-api.herokuapp.com/s/${body.beatmapset_id})`,
		'url': 'https://discordapp.com',
		'color': colour,
		'thumbnail': {
			'url': `https://b.ppy.sh/thumb/${body.beatmapset_id}.jpg`
		},
		'author': {
			'name': `${body.title} [${body.version}] +${mods.toString(body.enabled_mods)}`,
			'url': `https://osu.ppy.sh/beatmapsets/${body.beatmapset_id}#osu/${body.beatmap_id}`,
			'icon_url': `https://a.ppy.sh/${body.user_id}`
		},
		'footer': {
			'icon_url': 'https://cdn.discordapp.com/avatars/647218819865116674/30bf8360b8a5adef5a894d157e22dc34.png?size=128',
			'text': 'Always Remember, The beautiful bot loves you <3'
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