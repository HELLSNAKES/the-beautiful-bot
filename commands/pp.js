const getMap = require('../handlers/getMap');
const pp = require('../handlers/pp');

function show(client, msg, args) {
	getMap.getMaps(client, msg, (msgFunc, clientFunc, url, userid) => {
		pp.calculatepp(url.slice(url.indexOf('#osu/')+5), {string: args}, (json) => {
			msg.channel.send(`:yellow_circle: That is worth **${json.pp}pp**\n\`${(json.mods == '' ? 'No Mod' : json.mods)}\` \`${Math.round(parseFloat(json.accuracy)*10)/10}%\` \`${json.combo}\``);
		});
		console.log(`PP : ${userid} : ${url}`);
	});
}

module.exports = {
	show: show
};