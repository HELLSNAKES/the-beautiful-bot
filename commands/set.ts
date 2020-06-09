'use strict';

import { Message } from 'discord.js';

import * as error from '../handlers/error';
import * as database from '../handlers/database';
import * as argument from '../handlers/argument';

function execute(msg: Message, args: any) {
	var options = argument.parse(msg, args);
	if (options.error) return;

	database.read('users', {
		discordID: msg.author.id,
	}, (docs, err) => {
		
		if (err) {
			error.sendUnexpectedError(err, msg);
		}

		if (docs.length == 0) {
			database.write('users', {
				discordID: msg.author.id,
				osuUsername: args.join(' '),
				type: options.type,
				mode: options.mode
			}, (docs, err) => {
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
			}, () => {
				msg.channel.send(`:green_circle: Your osu username has been successfully updated to \`${args.join(' ')}\`!`);
			});
		}
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