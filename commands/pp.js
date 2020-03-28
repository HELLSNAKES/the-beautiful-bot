const getMap = require('../handlers/getMap');
const pp = require('../handlers/pp');
const request = require('request');

function show(client, msg, args) {
	getMap.getMaps(client, msg, (msgFunc, clientFunc, url, userid) => {
		pp.calculatepp(url.slice(url.indexOf('#osu/')+5), {string: args}, (json) => {
			request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${json.beatmapId}`, {
				json: true
			}, (err, res, body) => {
				if (json.mods.includes('DT')) body[0].bpm *= 1.5
				else if (json.mods.includes('HT')) body[0].bpm *= 0.75
			msg.channel.send(`:yellow_circle: That is worth **${json.pp}pp**\n\`${(json.mods == '' ? 'No Mod' : json.mods)}\` \`${Math.round(parseFloat(json.accuracy)*10)/10}%\` \`${json.combo}\` \`BPM: ${body[0].bpm}\` \`AR: ${json.AR}\` \`OD: ${json.OD}\` \`CS: ${json.CS}\` \`HP: ${json.HP}\``);
			});
		});
		console.log(`PP : ${userid} : ${url}`);
	});
}

module.exports = {
	show: show
};