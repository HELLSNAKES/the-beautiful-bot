const database = require('../handlers/database');
const request = require('request');
const recent = require('./recent');

function compare(client, msg) {
	console.log('compare')
	var done = false;
	msg.channel.fetchMessages()
		.then(messages => messages.forEach((message) => {
			console.log(message.content);
			console.log(message.embeds)
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

				request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${content.slice(content.indexOf('#osu/')+5)}`, {
					json: true
				}, (err, res, beatmapData) => {
					body = {
						...body[0],
						...beatmapData[0]
					}

					if (body.user_id == undefined) {
						msg.channel.send(`Sorry but I couldn't find any plays on \`${beatmapData[0].title} [${beatmapData[0].version}].\``);
						return;
					}
					body.accuracy = Math.floor((50 * parseInt(body.count50) + 100 * parseInt(body.count100) + 300 * parseInt(body.count300)) / (300 * (parseInt(body.count50) + parseInt(body.count100) + parseInt(body.count300) + parseInt(body.countmiss))) * 10000) / 100;
					recent.generateRecent(client,msg,body)
						console.log(`COMPARE : ${msg.author.id} : https://osu.ppy.sh/users/${body.user_id}`);


				});

			});
		}
	});
}

module.exports = {
	compare: compare
}