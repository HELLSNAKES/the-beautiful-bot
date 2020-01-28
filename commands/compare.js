const database = require('../handlers/database');
const request = require('request');
const { exec } = require('child_process')
const mods = require('../handlers/mods');
const format = require('../handlers/format');
const recent = require('./recent');

function compare(client, msg) {
	console.log('compare')
	var done = false;
	msg.channel.fetchMessages()
		.then(messages => messages.forEach((message) => {
			if (message.author.id != client.user.id || done) {
				return;
			}
			msg.channel.fetchMessage(message.id).then(fetchedMessage => {

				if (fetchedMessage.embeds[0].author.name.includes('Here are the top 5 plays for')) {
					sendCompareEmbed(msg, client, 0, fetchedMessage.embeds[0].description, msg.author.id);
				} else {
					sendCompareEmbed(msg, client, 1, fetchedMessage.embeds[0].author.url, msg.author.id);

				}

			}).catch((e) => console.log(e));
			done = true;
		}))
		.catch(console.error);
}

function sendCompareEmbed(msg,client, playType, content, userid) {
	database.read({
		discordID: userid
	}, (doc) => {
		if (playType == 1) {
			request(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&u=${doc.osuUsername}&b=${content.slice(content.indexOf('#osu/')+5)}`, (err, res, body) => {
				body = JSON.parse(body);
				console.log(body)

				request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${content.slice(content.indexOf('#osu/')+5)}`, {
					json: true
				}, (err, res, beatmapData) => {
					body = {
						...body[0],
						...beatmapData[0]
					}
					console.log(body)
					if (body.user_id == undefined) {
						msg.channel.send(`Sorry but I couldn't find any plays on \`${beatmapData[0].title} [${beatmapData[0].version}].\``);
						return;
					}
					console.log(body)
					body.accuracy = Math.floor((50 * parseInt(body.count50) + 100 * parseInt(body.count100) + 300 * parseInt(body.count300)) / (300 * (parseInt(body.count50) + parseInt(body.count100) + parseInt(body.count300) + parseInt(body.countmiss))) * 10000) / 100;
					recent.generateRecent(client,msg,body)
					// var grade = client.emojis.find(emoji => emoji.name === 'grade_' + body[0].rank.toLowerCase());
					// var accuracy = (50 * parseInt(body[0].count50) + 100 * parseInt(body[0].count100) + 300 * parseInt(body[0].count300)) / (300 * (parseInt(body[0].count50) + parseInt(body[0].count100) + parseInt(body[0].count300) + parseInt(body[0].countmiss)));
					// accuracy = Math.floor(accuracy * 10000) / 100;

					// exec(`curl -s https://osu.ppy.sh/osu/${content.slice(content.indexOf('#osu/')+5)} | node pp.js +${mods.toString(body[0].enabled_mods)} ${accuracy}% ${body[0].maxcombo}x ${body[0].countmiss}m`, (err, stdout, stderr) => {
					// 	if (err) {
					// 		// node couldn't execute the command
					// 		return;
					// 	}

					// 	var ojsama = stdout.replace('\n', '').split('$');

					// 	let modsApplied = mods.toString(body[0].enabled_mods);
					// 	var colour = 0;
					// 	if (body[0].rank.toLowerCase() == 'f' || body[0].rank.toLowerCase() == 'd') colour = 15158332;
					// 	else if (body[0].rank.toLowerCase() == 'c') colour = 10181046;
					// 	else if (body[0].rank.toLowerCase() == 'b') colour = 3447003;
					// 	else if (body[0].rank.toLowerCase() == 'a') colour = 3066993;
					// 	else if (body[0].rank.toLowerCase() == 's') colour = 15844367;
					// 	else if (body[0].rank.toLowerCase() == 'sh') colour = 12370112;
					// 	else if (body[0].rank.toLowerCase() == 'x') colour = 16580705;
					// 	else if (body[0].rank.toLowerCase() == 'xh') colour = 16580705;

					// 	var completion = 0;
					// 	if (body[0].rank.toLowerCase() == 'f') {
					// 		completion = Math.floor((parseInt(body[0].count50) + parseInt(body[0].count100) + parseInt(body[0].count300) + parseInt(body[0].countmiss)) / parseInt(ojsama[2]) * 10000) / 100;
					// 	}

					// 	if (modsApplied.includes('DT') || modsApplied.includes('HR') || modsApplied.includes('EZ') || modsApplied.includes('HT') || modsApplied.includes('NC')) {
					// 		ojsama[1] = Math.floor(beatmapData[0].difficultyrating * 100) / 100;
					// 	}

					// 	var accuracy = (50 * parseInt(body[0].count50) + 100 * parseInt(body[0].count100) + 300 * parseInt(body[0].count300)) / (300 * (parseInt(body[0].count50) + parseInt(body[0].count100) + parseInt(body[0].count300) + parseInt(body[0].countmiss)));
					// 	accuracy = Math.floor(accuracy * 10000) / 100;
					// 	let date = format.time(Date.parse(body[0].date));

					// 	const embed = {
					// 		'description': `${grade} - **${Math.floor(body[0].pp*100)/100}pp** - ${accuracy}%${body[0].perfect == 1 ? ' - __**[Full Combo!]**__' : ''}\n${'★'.repeat(Math.floor(beatmapData[0].difficultyrating))} **[${Math.floor(beatmapData[0].difficultyrating * 100)/100}★]${ojsama[1] != Math.floor(beatmapData[0].difficultyrating * 100)/100 ? ` (${ojsama[1]}★ with Mods)` : ''}**\nCombo: **x${format.number(body[0].maxcombo)}/x${format.number(beatmapData[0].max_combo)}**	Score: **${format.number(body[0].score)}**\n[${body[0].count300}/${body[0].count100}/${body[0].count50}/${body[0].countmiss}]${body[0].rank.toLowerCase() == 'f' ? `\nCompleted: **${completion}%**` :''}\nAchieved: **${date}**`,
					// 		'url': 'https://discordapp.com',
					// 		'color': colour,
					// 		'thumbnail': {
					// 			'url': `https://b.ppy.sh/thumb/${beatmapData[0].beatmapset_id}.jpg`
					// 		},
					// 		'author': {
					// 			'name': `${beatmapData[0].title} [${beatmapData[0].version}] +${mods.toString(body[0].enabled_mods)}`,
					// 			'url': `https://osu.ppy.sh/beatmapsets/${beatmapData[0].beatmapset_id}#osu/${beatmapData[0].beatmap_id}`,
					// 			'icon_url': `https://a.ppy.sh/${body[0].user_id}`
					// 		},
					// 		'footer': {
					// 			'icon_url': 'https://cdn.discordapp.com/avatars/647218819865116674/30bf8360b8a5adef5a894d157e22dc34.png?size=128',
					// 			'text': 'Always Remember, The beautiful bot loves you <3'
					// 		}
					// 	};
					// 	msg.channel.send({
					// 		embed
					// 	});

						console.log(`COMPARE : ${msg.author.id} : https://osu.ppy.sh/users/${body.user_id}`);


				});

			});
		}
	});
}

module.exports = {
	compare: compare
}