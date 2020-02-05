const getMaps = require('../handlers/getMap');
const request = require('request');
const mods = require('../handlers/mods');
const format = require('../handlers/format');
function leaderboard(client, msg) {
	getMaps.getMaps(client, msg, function(clientFunc, msgFunc, url, userid) {
		console.log();
		request(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&b=${url.slice(url.lastIndexOf('/')+1)}&limit=25`,(err, res, body) => {
			body = JSON.parse(body);
			console.log(body);
			var fields = [];
			console.log(body.length)
			for (var i = 0;i < body.length; i++) {
				fields.push({
					name: `**${i+1}. ${client.emojis.find(emoji => emoji.name === 'grade_' + body[i].rank.toLowerCase())} ${body[i].username} +${mods.toString(body[i].enabled_mods)}**`,
					value: `${Math.floor(body[i].pp)}pp [${body[i].count300}/${body[i].count100}/${body[i].count50}/${body[i].countmiss}] x${body[i].maxcombo}`,
					inline: true
				})
			}
			const embed = {
				"title": "Here is the Leaderboard for the most recent mentioned map in this chat",
				"color": 4886754,
				"footer": {
				  "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
				  "text": "footer text"
				},
				"fields": fields
			  };
	
			  msg.channel.send({ embed });
		});
	});
}

module.exports = {
	leaderboard: leaderboard
}