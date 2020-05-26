const errorHandler = require('../handlers/error');
const database = require('../handlers/database');
const argument = require('../handlers/argument');

function execute(msg, args) {
	args = args[0];
	if (args != '0' && args != '1' && args != '2' && args != '3') {
		errorHandler.log(msg, 4045);
		return;
	}
	args = parseInt(args[0]);
	database.read('users', {
		discordID: msg.author.id
	}, (docs, err) => {
		if (err) console.log(err);
		if (docs.length == 0) {
			errorHandler.log(msg, 4046);
		}
		if (docs[0].type != 0) {
			msg.channel.send(':no_entry: Sorry but only offical osu servers users can use $modeset');
			return;
		}

		database.update('users', {
			discordID: msg.author.id
		}, {
			mode: args
		}, (res, err) => {
			if (err) {
				console.log(err);
				return;
			}
			msg.channel.send(':white_check_mark: Your default mode has been successfully updated!');
		});
	});
}

module.exports = {
	name: 'modeset',
	description: 'Sets your default gamemode',
	group: 'osu',
	arguments: argument.getOtherArgumentDetails(['Gamemode']),
	execute: execute
};