'user-strict';

import { Message } from 'discord.js';

import * as error from '../handlers/error';
import * as database from '../handlers/database';
import * as argument from '../handlers/argument';

function execute(msg: Message, args: any) {
	if (typeof (args) != 'number' && (args[0] != '0' && args[0] != '1' && args[0] != '2' && args[0] != '3')) {
		error.log(msg, 4045);
		return;
	}
	args = parseInt(args[0]);
	database.read('users', {
		discordID: msg.author.id
	}, (docs, err) => {
		if (err) console.log(err);
		if (docs.length == 0) {
			error.log(msg, 4046);
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