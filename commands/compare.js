'use strict';

const request = require('request');
const recent = require('./recent');
const getMaps = require('../handlers/getMap');
const argument = require('../handlers/argument');

function execute(client, msg, args) {
	getMaps.getMaps(client, msg, function (msg, client, url) {
		argument.determineUser(msg, args, (user, options) => {
			sendCompareEmbed(client, msg, url, user, options);
			console.log(url, user, options);
		});
	});
}

function sendCompareEmbed(client, msg, url, user, options) {
	if (options.type == 0) {
		request(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&u=${user}&b=${url.slice(url.indexOf('#osu/')+5)}`, (err, res, body) => {
			body = JSON.parse(body);

			request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${url.slice(url.indexOf('#osu/')+5)}`, {
				json: true
			}, (err, res, beatmapData) => {
				if (err) console.log(err);

				body = {
					...body[0],
					...beatmapData[0]
				};
				body.pp = Math.floor(body.pp * 100) / 100;
				if (body.user_id == undefined) {
					msg.channel.send(`Sorry but I couldn't find any plays on \`${beatmapData[0].title} [${beatmapData[0].version}].\``);
					return;
				}
				recent.processData(client, msg, body, body.mode);
				console.log(`COMPARE : ${msg.author.id} : https://osu.ppy.sh/users/${body.user_id}`);
			});
		});
	} else {
		msg.channel.send(':no_entry: Sorry but private servers are not supported on $compare/$c yet');
	}
}

module.exports = {
	name: 'compare',
	execute: execute
};