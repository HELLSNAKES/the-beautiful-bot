const error = require('../handlers/error');
const request = require('request');
const requestPromiseNative = require('request-promise-native');
const mods = require('../handlers/mods');
const format = require('../handlers/format');
const gatariData = require('./convert/gatariData');
const argument = require('../handlers/argument');
const akatsukiData = require('./convert/akatsukiData');

function execute(client, msg, args) {
	argument.determineUser(msg, args, (user, options) => {
		sendRequest(client, msg, user, options);
	});
}

function sendRequest(client, msg, user, options) {
	if (options.type == 0) {
		request(`https://osu.ppy.sh/api/get_user_best?k=${process.env.osuAPI}&u=${user}&limit=100`, {
			json: true
		}, (err, res, body) => {
			sendBest(client, msg, user, body, options);
		});
	} else if (options.type == 1) {
		request(`https://api.gatari.pw/users/get?u=${user}`, {
			json: true
		}, (err, res, info) => {
			request(`https://api.gatari.pw/user/scores/best?id=${info.users[0].id}&l=100`, {
				json: true
			}, (err, res, body) => {
				sendBest(client, msg, user, gatariData.bestData(body, info), options);
			});
		});
	} else if (options.type == 2) {
		request(`https://akatsuki.pw/api/v1/users?name=${user}`, {
			json: true
		}, (err, res, info) => {
			request(`https://akatsuki.pw/api/v1/users/scores/best?name=${user}&rx=${options.relax}&l=100`, {
				json: true
			}, (err, res, body) => {
				sendBest(client, msg, user, akatsukiData.bestData(body, info), options);
			});
		});
	}
}

function sendBest(client, msg, user, body, options) {
	if (body.length == 0) {
		error.log(msg, 4041);
		return;
	}

	var plays = [];
	var playString = [];
	var playpp = [];
	var urls = [];
	var index = [];
	var userPictureUrl = `https://a.ppy.sh/${body[0].user_id}?${Date.now().toString()}`;
	var userUrl = `https://osu.ppy.sh/users/${body[0].user_id}`;

	if (options.type == 1) {
		userPictureUrl = `https://a.gatari.pw/${body[0].user_id}?${Date.now().toString()}`;
		userUrl = `https://osu.gatari.pw/u/${body[0].user_id}`;
	} else if (options.type == 2) {
		userPictureUrl = `https://a.akatsuki.pw/${body[0].user_id}?${Date.now().toString()}`;
		userUrl = `https://akatsuki.pw/u/${body[0].user_id}`;
	}

	const embed = {
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

	for (var i = 0; i < body.length && plays.length != 5; i++) {
		if (options.mods != -1) {
			if (options.modsInclude) {
				if (!mods.toString(body[i].enabled_mods).includes(mods.toString(options.mods))) {
					continue;
				}
			} else if (options.mods != parseInt(body[i].enabled_mods)) {
				continue;
			}
		}
		urls.push(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[i].beatmap_id}`);
		index.push(i);
		plays.push(requestPromiseNative(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[i].beatmap_id}`, {
			json: true
		}, (err, res, beatmapData) => {
			let j = index[urls.indexOf(res.request.href)];
			var grade = client.emojis.find(emoji => emoji.name === 'rank_' + body[j].rank.toLowerCase());
			var pp = Math.floor(body[j].pp * 100) / 100;
			var accuracy = Math.floor((50 * parseInt(body[j].count50) + 100 * parseInt(body[j].count100) + 300 * parseInt(body[j].count300)) / (300 * (parseInt(body[j].count50) + parseInt(body[j].count100) + parseInt(body[j].count300) + parseInt(body[j].countmiss))) * 10000) / 100;

			playString.push(`**[- ${beatmapData[0].title} [${beatmapData[0].version}]](${`https://osu.ppy.sh/beatmapsets/${beatmapData[0].beatmapset_id}#osu/${beatmapData[0].beatmap_id}`}) +${mods.toString(body[j].enabled_mods)}**\n| ${grade} - **${pp}pp** - ${accuracy}% - [${Math.floor(beatmapData[0].difficultyrating * 100) /100}★]\n| (**${format.number(body[j].maxcombo)}x**/**${format.number(beatmapData[0].max_combo)}x**) - **${format.number(body[j].score)}** - [${body[j].count300}/${body[j].count100}/${body[j].count50}/${body[j].countmiss}]\n| Achieved: **${format.time(Date.parse(body[j].date))}**\n`);
			playpp.push(pp);
		}));
	}
	embed.author.name = `Here is ${user}'s top ${urls.length} plays:`;
	Promise.all(plays).then(() => {
		var sortedpp = playpp.slice(0).sort((a, b) => {
			return (b - a);
		});
		var sortedString = [];
		for (i = 0; i < sortedpp.length; i++) {
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
	execute: execute
};