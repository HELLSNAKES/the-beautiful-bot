import { Message } from 'discord.js';

import * as error from '../handlers/error';
import * as database from '../handlers/database';
import * as argument from '../handlers/argument';
import * as score from '../handlers/score';

function execute(msg: Message, args: any) {
	if (args[0] != '0' && args[0] != '1' && args[0] != '2' && args[0] != '3') {
		msg.channel.send(`:red_circle: **Invalid ruleset**\n\`${args[0]}\` is not a valid gamemode.\nAvailable options: \`0\` - standard, \`1\` - taiko, \`2\` - catch & \`3\` - mania`);
		return;
	}

	const ruleset = Number(args[0]);

	database.read('users', {
		discordID: msg.author.id
	}, {})
		.then((docs) => {
			if (docs.length == 0) {
				msg.channel.send(`:red_circle: **\`@${msg.member.displayName}\` does not have an osu account linked**\nIn order to use $modeset, you must link your osu username to the bot first by using \`$set [username]\``);
				return;
			}

			if (docs[0].type != 0) {
				msg.channel.send(':red_circle: **umimplemented server type**\n Only offical osu servers are supported for now. $modeset will be implemented to other server types in the future');
				return;
			}

			database.update('users', {
				discordID: msg.author.id
			}, {
				mode: ruleset
			}, {}).then(() => {
				msg.channel.send(`:green_circle: **Your default mode has been successfully updated to osu! \`${score.getRuleset(args)}\`**`);
			}).catch(err => error.sendUnexpectedError(err, msg));
		}).catch(err => error.sendUnexpectedError(err, msg));
}

module.exports = {
	name: 'modeset',
	description: 'Sets your default gamemode',
	group: 'osu',
	arguments: argument.getOtherArgumentDetails(['Gamemode']),
	execute: execute
};