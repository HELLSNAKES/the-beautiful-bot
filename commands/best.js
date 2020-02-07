const database = require('../handlers/database');
const error = require('../handlers/error');
const request = require('request');
const requestPromiseNative = require('request-promise-native');
const mods = require('../handlers/mods');
const format = require('../handlers/format');
const gatariData = require('./convert/gatariData');
function best(client, msg, args) {
	var options = {
		type: 0 
	};
	for (var i = 0; i < args.length; i++) {
		if (args[i] == '-t') {
			options.type = parseInt(args[i + 1]);
			args.splice(i, 2);
		}
	}

	if (/<@![0-9]{18}>/g.test(args[0])) {
		var discordID = args[0].slice(3, 21);
		database.read({
			discordID: discordID
		}, (doc) => {
			sendRequest(client, msg, doc.osuUsername, doc.type);
		});
	} else if (args.length != 0) {
		sendRequest(client, msg, args.join('_'), options.type);
	} else {
		database.read({
			discordID: msg.author.id
		}, (doc) => {
			sendRequest(client, msg, doc.osuUsername, doc.type);
		});
	}
}

function sendRequest(client, msg, user, type = 0) {
	if (type == 0) {
	request(`https://osu.ppy.sh/api/get_user_best?k=${process.env.osuAPI}&u=${user}&limit=5`, {
		json: true
	}, (err, res, body) => {
		sendBest(client, msg, user, body);
	});
	} else if (type == 1) {
		request(`https://api.gatari.pw/users/get?u=${user}`, {json:true},(err, res, info) => {
			request(`https://api.gatari.pw/user/scores/best?id=${info.users[0].id}&l=5`, {json:true}, (err, res, body) => {
				sendBest(client, msg, user, gatariData.bestData(body, info), type)
			})
		})
	}
}

function sendBest(client, msg, user, body, type) {
	if (body.length == 0) {
		error.log(msg, 4041);
		return;
	}
	var plays = [];
	var playString = [];
	var playpp = [];
	var urls = [];
	userPictureUrl = `https://a.ppy.sh/${body[0].user_id}`
	userUrl = `https://osu.ppy.sh/users/${body[0].user_id}`

	if (type == 1) {
		userPictureUrl = `https://a.gatari.pw/${body[0].user_id}`
		userUrl = `https://osu.gatari.pw/u/${body[0].user_id}`
	}
	
	const embed = {
		'title': ``,
		'author': {
			'name': `Here are the top 5 plays for ${user}`,
			'url': userUrl
		},
		'description': '',
		'color': 12352831,
		'thumbnail': {
			'url': userPictureUrl
		},
		'footer': {
			'icon_url': 'https://cdn.discordapp.com/avatars/647218819865116674/30bf8360b8a5adef5a894d157e22dc34.png?size=128',
			'text': 'Always Remember, The beautiful bot loves you <3'
		}
	};

	for (var i = 0; i < body.length; i++) {
		urls.push(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[i].beatmap_id}`);
		plays.push(requestPromiseNative(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[i].beatmap_id}`, {
			json: true
		}, (err, res, beatmapData) => {
			let index = urls.indexOf(res.request.href);

			var grade = client.emojis.find(emoji => emoji.name === 'grade_' + body[index].rank.toLowerCase());
			var pp = Math.floor(body[index].pp * 100) / 100;
			var accuracy = Math.floor((50 * parseInt(body[index].count50) + 100 * parseInt(body[index].count100) + 300 * parseInt(body[index].count300)) / (300 * (parseInt(body[index].count50) + parseInt(body[index].count100) + parseInt(body[index].count300) + parseInt(body[index].countmiss))) * 10000) / 100;

			playString.push(`__**[${beatmapData[0].title} [${beatmapData[0].version} - ${Math.floor(beatmapData[0].difficultyrating * 100) /100}★] +${mods.toString(body[index].enabled_mods)}](${`https://osu.ppy.sh/beatmapsets/${beatmapData[0].beatmapset_id}#osu/${beatmapData[0].beatmap_id}`})**__\n${grade} - **${pp}pp** - ${accuracy}%\nCombo: **x${format.number(body[index].maxcombo)}/x${format.number(beatmapData[0].max_combo)}**	Score: **${format.number(body[index].score)}**\n[${body[index].count300}/${body[index].count100}/${body[index].count50}/${body[index].countmiss}]\nAchieved: **${format.time(Date.parse(body[index].date))}**\n`);
			playpp.push(pp);
		}));
	}
	Promise.all(plays).then(() => {

		var sortedpp = playpp.slice(0).sort((a, b) => {
			return (b - a);
		});
		var sortedString = [];
		for (i = 0; i < sortedpp.length; i++) {
			sortedString.push(playString[playpp.indexOf(sortedpp[i])]);
		}
		embed.description = sortedString.join(' ');
		msg.channel.send({
			embed
		});
		console.log(`BEST : ${msg.author.id} : https://osu.ppy.sh/users/${body[0].user_id}`);
	});
}

module.exports = {
	best: best
};