const getMap = require('../handlers/getMap');
const {
	exec
} = require('child_process');

function pp(client, msg, args) {
	getMap.getMaps(client, msg, (msgFunc, clientFunc, url, userid) => {
		exec(`curl -s https://osu.ppy.sh/osu/${url.slice(url.indexOf('#osu/')+5)} | node handlers/pp.js ${args}`, (err, stdout) => {
			var ojsama = stdout.replace('\n', '').split('$');
			msg.channel.send(`:yellow_circle: That is worth **${ojsama[0]}pp**`);
		});
		console.log(`PP : ${userid} : ${url}`);
	});
}

module.exports = {
	pp: pp
};