'use strict';

import { Message } from 'discord.js';

import * as database from '../handlers/database';
import * as argument from '../handlers/argument';

function execute(msg: Message, args: any) {
	var options = argument.parse(msg, args);
	if (options.error) return;

	database.read('users', {
		discordID: msg.author.id,
	}, (docs, err) => {
		if (err) {
			database.write('users', {
				discordID: msg.author.id,
				osuUsername: args.join(' '),
				type: options.type,
				mode: options.mode
			}, (docs, error) => {
				if (error) {
					console.log(error);
				} else {
					msg.channel.send(':white_check_mark: Your osu username has been successfully linked!');
				}
			});

		} else {
			database.update('users', {
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

module.exports = {
	name: 'set',
	description: 'Links or updates your osu username',
	group: 'osu',
	options: argument.getArgumentDetails(['type']),
	arguments: argument.getOtherArgumentDetails(['Username']),
	execute: execute
};