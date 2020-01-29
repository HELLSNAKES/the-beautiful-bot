function changelog(msg) {
	const embed = {
		'title': 'All of the latest changes can be found on The Beautiful Bot website',
		'description': 'https://the-beautiful-bot.netlify.com/changelog\nIf you want a more indepth changelog you can check out The Beautiful Bot\'s GitHub Page\nhttps://github.com/Moorad/the-beautiful-bot/commits/master',
		'color': 1492731,
		'image': {
			'url': 'https://i.imgur.com/v3T71xU.png'
		},
	};
	msg.channel.send({ embed });
}

module.exports = {
	changelog: changelog
};