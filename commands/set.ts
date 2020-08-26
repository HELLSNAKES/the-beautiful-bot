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
		}, {}, (docs, err) => {
			
			if (err) {
				error.sendUnexpectedError(err, msg);
			}
	
			if (docs.length == 0) {
				database.write('users', {
					discordID: msg.author.id,
					osuUsername: args.join(' '),
					type: options.type,
					mode: options.mode
				}, {}, (docs, err) => {
					if (err) {
						error.sendUnexpectedError(err, msg);
					} else {
						msg.channel.send(`:green_circle: Your osu username has been successfully set to \`${args.join(' ')}\`!`);
					}
				});
	
			} else {
				database.update('users', {
					discordID: msg.author.id
				}, {
					osuUsername: args.join(' '),
					type: options.type
				}, {}, () => {
					msg.channel.send(`:green_circle: Your osu username has been successfully updated to \`${args.join(' ')}\`!`);
				});
			}
		});
	}).catch(() => {
		msg.channel.send(`:red_circle: **\`${args.join(' ')}\` is an invalid username**\nThe username \`${args.join(' ')}\` does not exists on \`${score.getServer(String(options.type))} servers\``);
	});
}

module.exports = {
	name: 'set',
	description: 'Links or updates your osu username',
	group: 'osu',
	options: argument.getArgumentDetails(['type']),
	arguments: argument.getOtherArgumentDetails(['Username']),
	execute: execute
};