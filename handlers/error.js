// Errors
// 4040 - Any other error
// 4041 - Username not found
// 4042 - Beatmap not found
// 4043 - File not found
// 4044 - No recent play found
// 4045 - Badly formatted arguments
// 4046 - User not found in the database

'use strict';

const request = require('request');

function log(msg, errCode) {
	if (errCode == 4041) {
		console.log('Error 4041');
		msg.channel.send(':no_entry: **Unknown username!** This username doesn\'t seem to exist, check if you spelled the name correctly');
	} else if (errCode == 4042) {
		console.log('Error 4042');
		msg.channel.send(':no_entry: **Unknown beatmap!** Sadly I couldn\'t find the map your are searching for, check if you spelled the name of the beatmap correctly');
	} else if (errCode == 4044) {
		console.log('Error 4044');
		msg.channel.send(':no_entry: **No recent plays** were found that were achieved in the last 24h, this could be due to an invalid username so check if you spelled the name correctly or click some circles');
	} else if (errCode == 4045) {
		console.log('Error 4045');
		msg.channel.send(':no_entry: **Badly formatted command arguments**. Please use the commands in this format `$command -a 5 -b 10 -c 0 Username`.\nMake sure that the Username goes last.');
	} else if (errCode == 4046) {
		msg.channel.send(':no_entry: **User was not found in the Database**. Use their osu username instead or they can link their account by typing `$osuset [Your osu username]`');

	} else {
		console.log('Error 4040');
		msg.channel.send('Error 4040');
	}
}

function unexpectedError(err, msg) {
	if (!msg) msg = {
		content: 'No message'
	};
	console.error(err);
	const embed = {
		'description': `\n\nError stack:\n\`\`\`${err.stack}\`\`\`\nThe error has been automatically reported to Moorad.`,
		'color': 16725838,
		'timestamp': Date.now()
	};
	sendToSlack(msg, err, () => {
		msg.channel.send('**An unexpected error has occured**', {
			embed
		});
	});

}

function sendToSlack(msg, err, callback) {
	if (process.env.slackAPI) {
		var message = `An unexpected error has occured\nError Stack:\n\`\`\`${err.stack}\`\`\`\nCall Stack:\n\`\`\`${new Error().stack}\`\`\`\nMessage content before the error:\n\`\`\`${msg.content}\`\`\``;
		request.post({
			url: process.env.slackAPI,
			body: {
				'text': message
			},
			json: true
		}, () => {
			callback();
		});

	} else {
		console.error('Slack Incoming Webhook URL was not found in the Environment Variables');
		callback();
	}
}

module.exports = {
	log: log,
	unexpectedError: unexpectedError
};