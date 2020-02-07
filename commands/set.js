const database = require('../handlers/database');

function set(msg, args) {
	var options = {type: 0};
	for (var i = 0; i < args.length; i++) {
		if (args[i] == '-t') {
			options.type = parseInt(args[i + 1]);
			args.splice(i, 2);
		}
	}
	database.read({
		discordID: msg.author.id,
	}, (doc) => {
		if (doc.error) {
			database.write({
				discordID: msg.author.id,
				osuUsername: args.join(' '),
				type: options.type
			});	
			msg.channel.send(':white_check_mark: Your osu username has been successfully linked!');
		} else {
			database.update({
				discordID: msg.author.id
			}, {
				osuUsername: args.join('_'),
				type: options.type
			}, function () {
				msg.channel.send(':white_check_mark: Your osu username has been successfully updated!');
			});
		}
	});
}

module.exports = {
	set: set
};