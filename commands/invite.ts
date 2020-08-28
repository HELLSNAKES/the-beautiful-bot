import { Message } from 'discord.js';

function execute(msg : Message) {
	const embed = {
		'title': ':link: Invite link',
		'url': 'https://discordapp.com/oauth2/authorize?client_id=647218819865116674&permissions=0&scope=bot',
		'description': 'If you need any assistance with anything, you can contact `Moorad#7782`',
		'color': 1492731
	};
	msg.channel.send({embed});
}

module.exports = {
	name: 'invite',
	description: 'Get the invite link for the bot',
	group: 'general',
	example: 'https://i.imgur.com/V9fC78p.png',
	execute: execute
};