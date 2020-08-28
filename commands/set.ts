import { Message } from 'discord.js';

import * as error from '../handlers/error';
import * as database from '../handlers/database';
import * as argument from '../handlers/argument';
import * as utility from '../handlers/utility';
import * as score from '../handlers/score';

function execute(msg: Message, args: any) {
	var options = argument.parse(msg, args);
	if (options.error) return;
	utility.checkUser(args.join(' '), options.type).then(() => {
		database.read('users', {
			discordID: msg.author.id,
		}, {})
			.then((docs) => {
				if (docs.length == 0) {
					database.write('users', {
						discordID: msg.author.id,
						osuUsername: args.join(' '),
						type: options.type,
						mode: options.mode
					}, {})
						.then(() => msg.channel.send(`:green_circle: Your osu username has been successfully set to \`${args.join(' ')}\`!`))
						.catch(err => error.sendUnexpectedError(err, msg));

				} else {
					database.update('users', {
						discordID: msg.author.id
					}, {
						osuUsername: args.join(' '),
						type: options.type
					}, {})
						.then(() => msg.channel.send(`:green_circle: Your osu username has been successfully updated to \`${args.join(' ')}\`!`))
						.catch(err => error.sendUnexpectedError(err, msg));

				}
			}).catch(err => error.sendUnexpectedError(err, msg));
	}).catch(() => {
		msg.channel.send(`:red_circle: **\`${args.join(' ')}\` is an invalid username**\nThe username \`${args.join(' ')}\` does not exists on \`${score.getServer(String(options.type))} servers\``);
	});
}

module.exports = {
	name: 'set',
	description: 'Links or updates your osu username',
	aliases: ['osuset'],
	group: 'osu',
	options: argument.getArgumentDetails(['type']),
	arguments: argument.getOtherArgumentDetails(['Username']),
	examples: 'https://i.imgur.com/Q4B4nf0.png',
	execute: execute
};