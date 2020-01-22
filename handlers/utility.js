const request = require('request');
const error = require('../handlers/error');

function checkUser(msg, data, callback) {
	request(`https://osu.ppy.sh/api/get_user?k=${process.env.osuAPI}&u=${data.osuUsername}`, {
		json: true
	}, (err, res, body) => {
		if (body.length == 0) {
			error.log(msg, 4041);
			return;
		} else {
			msg.channel.send('**Your osu Username has been successfully connected!**\nType `$help` to see the list of commands available');
			callback(data);
		}
	});
}

module.exports = {
	checkUser: checkUser
};