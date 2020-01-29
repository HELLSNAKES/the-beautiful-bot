const database = require('../handlers/database');
const request = require('request');
const recent = require('./recent');

function compare(client, msg) {
	var done = false;
	var regex = new RegExp('https://osu.ppy.sh/beatmapsets/[0-9]+#osu/[0-9]+', 'g');
	msg.channel.fetchMessages()
		.then(messages => messages.forEach((message) => {
			if (done) return;
			
			if (regex.test(message.content)) {
				sendCompareEmbed(msg, client, message.content, msg.author.id);
				done = true;
				return;
			}

			if (message.embeds.length > 0) {
				message.embeds.forEach((x) => {
					if (x.author != null && regex.test(x.author.url)) {
						sendCompareEmbed(msg, client, x.author.url, msg.author.id)
						done = true;
					}
				});
			}

			


		})).catch(console.error);
	// console.log(message.embeds)
	// if (done) {
	// 	return;
	// }
	// msg.channel.fetchMessage(message.id).then(fetchedMessage => {
	// 	
	// 	if (fetchedMessage.embeds.length > 0 && fetchedMessage.embeds[0].type == 'rich' && regex.test(fetchedMessage.embeds[0].author.url)) {
	// 		fetchedMessageArray.push(fetchedMessage.embeds[0].author.url)
	// 		// 
	// 	}
	// 	if (regex.test(fetchedMessage.content)) {
	// 		fetchedMessageArray.push(fetchedMessage.content);
	// 		// sendCompareEmbed(msg, client, fetchedMessage.content, msg.author.id);
	// 	}
	// 	console.log(fetchedMessageArray);
	// }).catch((e) => console.log(e));
	// done = true;

}

function sendCompareEmbed(msg, client, url, userid) {
	database.read({
		discordID: userid
	}, (doc) => {
		request(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&u=${doc.osuUsername}&b=${url.slice(url.indexOf('#osu/')+5)}`, (err, res, body) => {
			body = JSON.parse(body);

			request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${url.slice(url.indexOf('#osu/')+5)}`, {
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
				recent.generateRecent(client, msg, body)
				console.log(`COMPARE : ${msg.author.id} : https://osu.ppy.sh/users/${body.user_id}`);


			});

		});
	});
}

module.exports = {
	compare: compare
}