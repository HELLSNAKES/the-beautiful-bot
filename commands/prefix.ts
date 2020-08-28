import { Message } from 'discord.js';
import * as argument from '../handlers/argument';
import * as database from '../handlers/database';
import * as error from '../handlers/error';

function execute(msg: Message, args: Array<string>) {
	
	if (args[0] == 'set') {
		if (!msg.member.hasPermission('ADMINISTRATOR')) {
			msg.channel.send(':red_circle: **User does not have administrator permissions**\nYou must have adminstrator permissions to be able to update this server\'s prefix');
			return;
		}
		database.read('servers', { serverID: msg.guild.id }, {})
			.then((docs) => {
				if (docs.length == 0) {
					database.write('servers', { serverID: msg.guild.id, prefixOverwrite: args[1] }, {})
						.then(() => {
							msg.channel.send(`:green_circle: **The server's prefix has been successfully set to \`${args[1]}\`**`);
						}).catch(err => error.sendUnexpectedError(err, msg));
				} else {
					database.update('servers', { serverID: msg.guild.id }, { prefixOverwrite: args[1] }, {})
						.then(() => {
							msg.channel.send(`:green_circle: **The server's prefix has been successfully updated to \`${args[1]}\`**`);
						}).catch(err => error.sendUnexpectedError(err, msg));
				}
			}).catch(err => error.sendUnexpectedError(err, msg));
	} else if (args[0] == 'reset') {
		if (!msg.member.hasPermission('ADMINISTRATOR')) {
			msg.channel.send(':red_circle: **User does not have administrator permissions**\nYou must have adminstrator permissions to be able to update this server\'s prefix');
			return;
		}
		database.read('servers', { serverID: msg.guild.id }, {})
			.then((docs) => {
				if (docs.length == 0 || docs[0].prefixOverwrite == '$') {
					msg.channel.send(':yellow_circle: **The server\'s prefix is already set to the default `$` prefix**');
					return;
				}
				database.update('servers', { serverID: msg.guild.id }, { prefixOverwrite: '' }, { unset: true})
					.then(() => {
						msg.channel.send(':green_circle: **The server\'s prefix has been successfully reset to `$`**');
					}).catch(err => error.sendUnexpectedError(err, msg));
			}).catch(err => error.sendUnexpectedError(err, msg));
	} else if (args[0] == 'show') {
		database.read('servers', { serverID: msg.guild.id }, {})
			.then((docs) => {
				if (docs.length == 0) {
					msg.channel.send(':blue_circle: **Current prefix: `$`**');
				} else {
					msg.channel.send(`:blue_circle: **Current prefix: \`${docs[0].prefixOverwrite}\`**`);
				}
			});
	} else {
		msg.channel.send(`:red_circle: **\`${args[0]}\` is not a valid option.**\nUse \`$help prefix\` to see available options`);
	}
}

module.exports = {
	name: 'prefix',
	description: 'Show or modify the bot\'s prefix for current server',
	aliases: ['pfx'],
	group: 'moderation',
	arguments: argument.getOtherArgumentDetails(['Action']),
	example: 'https://i.imgur.com/lzr2wPJ.png',
	execute: execute
};