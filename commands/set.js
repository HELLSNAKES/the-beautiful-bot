const database = require('../handlers/database');
const argument = require('../handlers/argument');

function set(msg, args) {
	var options = argument.parse(msg, args);
	if (options.error) return;

	database.read('users',{
		discordID: msg.author.id,
	}, (docs,err) => {
		if (err) {
			database.write('users',{
				discordID: msg.author.id,
				osuUsername: args.join(' '),
				type: options.type
			}, (error) => {
				if (err) {
					console.log(error)
				} else {
					msg.channel.send(':white_check_mark: Your osu username has been successfully linked!');
				}
			});
			
		} else {
			database.update('users',{
				discordID: msg.author.id
			}, {
				osuUsername: args.join('_'),
				type: options.type
			}, () => {
				msg.channel.send(':white_check_mark: Your osu username has been successfully updated!');
			});
		}
	});
}

function mode(msg, args) {
	
}

module.exports = {
	set: set
};