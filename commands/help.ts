import { Message } from 'discord.js';
import { ICommand } from '../handlers/interfaces';

import * as argument from '../handlers/argument';

function execute(client: any, msg: Message, args: Array<string>, prefix : string) {
	const embed: any = {
		'title': 'List of commands available',
		'description': '',
		'color': 14684241,
		'fields': []
	};



	if (args.length == 0) {
		embed.fields[0] = {
			name: 'osu! commands',
			value: '',
			inline: false
		};

		embed.fields[1] = {
			name: 'general commands',
			value: ''
		};

		embed.fields[2] = {
			name: 'moderation commands',
			value: ''
		};

		client.commands.forEach((command: ICommand) => {
			if (command.group == undefined) return;

			if (command.group == 'osu') {
				embed.fields[0].value += `\`${prefix}${command.name}\`: ${command.description}\n`;
			}

			if (command.group == 'general') {
				embed.fields[1].value += `\`${prefix}${command.name}\`: ${command.description}\n`;
			}

			if (command.group == 'moderation') {
				embed.fields[2].value += `\`${prefix}${command.name}\`: ${command.description}\n`;
			}
		});
	} else {
		embed.title = '';

		if (args[0].startsWith(prefix)) args[0] = args[0].slice(1);

		let cmd: ICommand = {};

		client.commands.some((command: ICommand) => {
			if (command.name == args[0] || (command.aliases && command.aliases.includes(args[0]))) {
				cmd = command;
				return true;
			}
		});

		if (cmd == undefined || Object.keys(cmd).length == 0) {
			msg.channel.send(`:red_circle: **\`${args[0]}\` is an unrecognised command**\nThe command you specified is not recognised. Type \`${prefix}help\` to view the full list of commands available\n(If you believe this is a bug or have a suggestion use \`${prefix}report [description of bug/suggestion]\`)`);
			return;
		}

		embed.description = `${prefix}${cmd.name}${cmd.options ? ' [Options]' : ''}`;

		if (cmd.arguments) {
			for (let i = 0; i < cmd.arguments.length; i++) {
				embed.description += ` [${cmd.arguments[i].name}]`;
			}
		}

		embed.description = '```' + embed.description + '```';

		if (cmd.description) {
			embed.description += `\n${cmd.description}`;
		}

		if (cmd.aliases) {

			embed.description += '\n**Aliases** : ';

			for (let i = 0; i < cmd.aliases.length; i++) {
				embed.description += `\`${cmd.aliases[i]}\``;

				if (i != cmd.aliases.length - 1) embed.description += ' | ';
			}
		}

		embed.description += '\n';

		if (cmd.options) {
			embed.description += '\n**[Options]**\n';
			for (let i = 0; i < cmd.options.length; i++) {
				embed.description += `**${cmd.options[i].noInitialPrefix ? '' : '-'}${cmd.options[i].name}** :\n`;

				if (cmd.options[i].description) embed.description += `${cmd.options[i].description}\n`;

				if (!Object.prototype.hasOwnProperty.call(cmd.options[i], 'allowedValues')) continue;
				if (typeof cmd.options[i].allowedValues == 'object') {
					for (let j = 0; j < Object.keys(cmd.options[i].allowedValues || {}).length; j++) {
						embed.description += `\`${Object.keys(cmd.options[i].allowedValues || {})[j]}\`: ${Object.values(cmd.options[i].allowedValues || {})[j]}`;

						if (j != Object.keys(cmd.options[i].allowedValues || {}).length - 1) embed.description += ' | ';
						else embed.description += '\n';
					}
				} else {
					embed.description += `Acceptable values: ${cmd.options[i].allowedValues}\n`;
				}
			}
		}

		if (cmd.arguments) {
			for (let i = 0; i < cmd.arguments.length; i++) {
				embed.description += `\n**[${cmd.arguments[i].name}]**\n${cmd.arguments[i].description}`;

				if (i == cmd.arguments.length - 1) embed.description += '\n';
			}
		}

		if (cmd.example) {
			embed.description += `\n[**Example**](${cmd.example})`;
		}
	}

	msg.channel.send({
		embed
	});
}



module.exports = {
	name: 'help',
	description: 'Displays help with commands',
	aliases: ['hl'],
	group: 'general',
	arguments: argument.getOtherArgumentDetails(['Command']),
	example: 'https://i.imgur.com/lp6Wdrv.png',
	execute: execute
};