const database = require('../handlers/database');
const utility = require('../handlers/utility');
function rename(msg, args) {
	if (args.length != 0) {
		database.update({
			discordID: msg.author.id
		}, {
			osuUsername: args.join('_')
		}, function () {
			msg.channel.send('Your osu username linked with your account has been successfully updated!');
		});
	} else {
		msg.channel.send('Osu username has not been provided.');
		console.log(`FAILED TO RENAME : ${msg.author.id}`);
	}
}


function set(msg, args) {
	utility.checkUser(msg, {
		discordID: msg.author.id,
		osuUsername: args.join(' ')
	}, function (data) {
		database.write(data);
	});
}

module.exports = {
	rename: rename,
	set: set
};