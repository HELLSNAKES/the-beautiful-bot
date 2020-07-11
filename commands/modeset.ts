'user-strict';

import { Message } from 'discord.js';

import * as error from '../handlers/error';
import * as database from '../handlers/database';
import * as argument from '../handlers/argument';
import * as score from '../handlers/score';
function execute(msg: Message, args: any) {
	if (typeof (args) != 'number' && (args[0] != '0' && args[0] != '1' && args[0] != '2' && args[0] != '3')) {
		error.log(msg, 4045);
		return;
	}
	args = parseInt(args[0]);
	database.read('users', {
		discordID: msg.author.id
	}, {},(docs, err) => {
		if (err) console.log(err);
		if (docs.length == 0) {
			msg.channel.send(`:red_circle: **\`@${msg.member.displayName}\` does not have an osu account linked**\nIn order to use $modeset, you must link your osu username to the bot first by using \`$set [username]\``);
		}
		if (docs[0].type != 0) {
			msg.channel.send(':no_entry: Sorry but only offical osu servers users can use $modeset');
			return;
		}

		database.update('users', {
			discordID: msg.author.id
		}, {
			mode: args
		}, {},(res, err) => {
			if (err) {
				console.log(err);
				return;
			}
			msg.channel.send(`:green_circle: **Your default mode has been successfully updated to osu! \`${score.getRuleset(args)}\`**`);
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