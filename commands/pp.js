const getMap = require('../handlers/getMap');
const pp = require('../handlers/pp');
const request = require('request');
const argument = require('../handlers/argument');

function execute(client, msg, args) {
	getMap.getMaps(client, msg, (msgFunc, clientFunc, url, userid) => {
		pp.calculatepp(url.slice(url.indexOf('#osu/') + 5), argument.parseOjsama(args), (json, err) => {
			if (err) {
				msg.channel.send(':no_entry: ' + err);
				return;
			}
			request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${json.beatmapId}`, {
				json: true
			}, (err, res, body) => {
				json.pp = Math.round(json.pp * 100) / 100;
				if (json.mods.includes('DT')) body[0].bpm *= 1.5;
				else if (json.mods.includes('HT')) body[0].bpm *= 0.75;
				msg.channel.send(`:yellow_circle: That is worth **${json.pp}pp**\n\`${(json.mods == '' ? 'No Mod' : json.mods)}\` \`${Math.round(parseFloat(json.accuracy)*10)/10}%\` \`${json.combo}/${json.maxCombo}x\` \`BPM: ${body[0].bpm}\` \`AR: ${json.AR}\` \`OD: ${json.OD}\` \`CS: ${json.CS}\` \`HP: ${json.HP}\` \`★: ${json.stars}\``);
			});
		});
		console.log(`PP : ${userid} : ${url}`);
	});
}

module.exports = {
	name: 'pp',
	execute: execute
};