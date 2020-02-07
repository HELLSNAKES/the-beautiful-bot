const database = require('../handlers/database');
const request = require('request');
const recent = require('./recent');
const getMaps = require('../handlers/getMap');
function compare(client, msg) {
	getMaps.getMaps(client, msg, function(msg, client , url, userid) {
		sendCompareEmbed(msg, client, url, userid)
	});

}

function sendCompareEmbed(msg, client, url, userid) {
	database.read({
		discordID: userid
	}, (doc) => {
		console.log('working')
		if (doc.type != 0) {
			msg.channel.send(':no_entry: Sorry but private servers are not supported on $compare/$c yet');
			return;	
		}
		request(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&u=${doc.osuUsername}&b=${url.slice(url.indexOf('#osu/')+5)}`, (err, res, body) => {
			body = JSON.parse(body);

			request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${url.slice(url.indexOf('#osu/')+5)}`, {
				json: true
			}, (err, res, beatmapData) => {
				body = {
					...body[0],
					...beatmapData[0]
				};
				if (body.pp == null) {
					body.pp = 0;
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
};