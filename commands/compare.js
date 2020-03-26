const database = require('../handlers/database');
const request = require('request');
const recent = require('./recent');
const getMaps = require('../handlers/getMap');
const argument = require('../handlers/argument');
const error = require('../handlers/error');
const pp = require('../handlers/pp');
const mods = require('../handlers/mods');

function compare(client, msg, args) {
	getMaps.getMaps(client, msg, function (msg, client, url) {
		var options = argument.parse(msg, args);

		if (options.error) return;

		if (/<@![0-9]{18}>/g.test(args[0])) {
			var discordID = args[0].slice(3, 21);
			database.read('users',{
				discordID: discordID
			}, (docs) => {
				if (err) {
					error.log(msg, 4046);
					return;
				}
				sendCompareEmbed(client, msg, url, docs[0].osuUsername, options);
			});
		} else if (args.length != 0) {
			sendCompareEmbed(client, msg, url, args.join('_'), options);
		} else {
			database.read('users',{
				discordID: msg.author.id
			}, (docs,err) => {
				if (err) {
					error.log(msg, 4046);
					return;
				}
				options.type = docs[0].type;
				sendCompareEmbed(client, msg, url, docs[0].osuUsername, options);
			});
		}
	});
}

function sendCompareEmbed(client, msg, url, user, options) {
	if (options.type == 0) {
		request(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&u=${user}&b=${url.slice(url.indexOf('#osu/')+5)}`, (err, res, body) => {
			body = JSON.parse(body);

			request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${url.slice(url.indexOf('#osu/')+5)}`, {
				json: true
			}, (err, res, beatmapData) => {
				body[0].accuracy = Math.floor((50 * parseInt(body[0].count50) + 100 * parseInt(body[0].count100) + 300 * parseInt(body[0].count300)) / (300 * (parseInt(body[0].count50) + parseInt(body[0].count100) + parseInt(body[0].count300) + parseInt(body[0].countmiss))) * 10000) / 100;
				//
				pp.calculatepp(beatmapData[0].beatmap_id,{
					mods: mods.toString(body[0].enabled_mods),
					accuracy: body[0].accuracy,
					combo: body[0].maxcombo,
					misses: body[0].countmiss,
					count100: body[0].count100,
					count50: body[0].count50
				}, (json) => {
		
					if (err) console.log(err);	
					body[0].calculated_difficulty = json.stars
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

					recent.generateRecent(client, msg, body);
					console.log(`COMPARE : ${msg.author.id} : https://osu.ppy.sh/users/${body.user_id}`);
				});
			});
		});
	} else {
		msg.channel.send(':no_entry: Sorry but private servers are not supported on $compare/$c yet');
	}
}

module.exports = {
	compare: compare
};