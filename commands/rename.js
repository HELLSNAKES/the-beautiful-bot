const database = require('../handlers/database');

function rename(msg, args) {
if (args.length != 0) {
	database.update({discordID: msg.author.id},{osuUsername:args.join('_')}, function () {
		msg.channel.send('Your osu username linked with your account has been successfully updated!');
	});
} else {
	msg.channel.send('Osu username has not been provided.');
	console.log(`FAILED TO RENAME : ${msg.author.id}`);
}
}

module.exports = {
	rename: rename
};