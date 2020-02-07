function help(msg, prefix) {
	msg.channel.send({
		'embed': {
			'description': `**---- osu! ----**
				**\`${prefix}osuset [Username]\`** or **\`$os [Username]\`**
				The osuset command will link your discord with your osu account which will be used in other osu commands
				**\`${prefix}osu [Username]\`**
				The user command displays the stats of the specified user. if no osu username is specified then the username linked with account will be used (refer to **\`${prefix}osuset\`**)
				**\`${prefix}best\`** or **\`$bt\`**
				The best command displays top 5 plays of the specified user. if no osu username is specified then the username linked with account will be used (refer to **\`${prefix}osuset\`**)
				**\`${prefix}map [Beatmap name or beatmap id]\`** or **\`${prefix}mp [Beatmap name or beatmap id]\`**
				The Beatmap command shows you the stats of the specified map
				**\`${prefix}recent -p [previous play number] [Username]\`** or **\`${prefix}rs -p [previous play number] [Username]\`**
				(Note the \`-p\` argument is optional)The recent command shows you the stats of the most recent play/s
				**\`${prefix}osurename [Username]\`** or **\`${prefix}or [Username]\`**
				The rename command will change the osu account linked with your discord.
				**---- General ----**
				**\`${prefix}help\`** or **\`${prefix}hl\`**
				The help commands will display this command list**\`${prefix}cat\`**
				:)
				**\`${prefix}changelog [Number of commits (optional)]\`** or **\`${prefix}cl [Number of commits (optional)]\`**
				The changelog command shows the latest specified number of commits and merges (5 if no number was given) on [the beautiful bot's repo](https://github.com/Moorad/the-beautiful-bot)`,
			'color': 3066993,
			'footer': {
				'icon_url': 'https://i.imgur.com/34evAhO.png',
				'text': 'Always Remember, The beautiful bot loves you <3'
			}
		}
	});
	console.log(`HELP : ${msg.author.id}`);
}



module.exports = {
	help: help
};