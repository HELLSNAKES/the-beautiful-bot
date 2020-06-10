import { Message } from 'discord.js';
import * as argument from '../handlers/argument';
import * as database from '../handlers/database';

function execute(msg : Message, args : Array<string>) {
	if (args[0] == 'set') {
		database.read('servers', {serverID: msg.guild.id}, (docs) => {
			if (docs.length == 0) {
				database.write('servers', { serverID: msg.guild.id, prefixOverwrite: args[1] }, () => {
					msg.channel.send(`:green_circle: **The server's prefix has been successfully set to \`${args[1]}\`**`);
				});
			} else {
				database.update('servers', {serverID: msg.guild.id}, {prefixOverwrite: args[1]}, () => {
					msg.channel.send(`:green_circle: **The server's prefix has been successfully updated to \`${args[1]}\`**`);
				});
			}
		});
	} else if (args[0] == 'reset') {
		database.read('servers', {serverID: msg.guild.id}, (docs) => {
			if (docs.length == 0 || docs[0].prefixOverwrite == '$') {
				msg.channel.send(':yellow_circle: **The server\'s prefix is already set to the default `$` prefix**');
				return;
			}
			database.update('servers', {serverID: msg.guild.id}, {prefixOverwrite: '$'}, () => {
				msg.channel.send(':green_circle: **The server\'s prefix has been successfully reset to `$`**');
			});
		});
	} else if (args[0] == 'show') {
		database.read('servers', {serverID: msg.guild.id}, (docs) => {
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
	execute: execute
};