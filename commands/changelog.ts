import { Message } from 'discord.js';

function execute(msg: Message) {
	const embed = {
		'title': 'All of the latest changes can be found on The Beautiful Bot website',
		'description': '[Changelog file in TBB\'s Github repo](https://github.com/moorad/the-beautiful-bot/blob/master/CHANGELOG.md) or [TBB\'s website](https://the-beautiful-bot.netlify.com/changelog)\nIf you want a more indepth changelog you can check out The Beautiful Bot\'s GitHub Page\nhttps://github.com/Moorad/the-beautiful-bot/commits/master',
		'color': 1492731
	};
	msg.channel.send({
		embed
	});
}

module.exports = {
	name: 'changelog',
	description: 'Where to find the changelog',
	aliases: ['update', 'updates'],
	group: 'general',
	example: 'https://i.imgur.com/gtNw03X.png',
	execute: execute
};