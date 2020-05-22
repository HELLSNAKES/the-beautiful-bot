'use strict';

function getMaps(client, msg, callback) {
	var done = false;
	var regex = new RegExp('https://osu.ppy.sh/beatmapsets/[0-9]+#osu/[0-9]+', 'g');
	var count = 0;
	msg.channel.fetchMessages()
		.then(messages => messages.forEach((message) => {
			if (done) return;

			if (regex.test(message.content)) {
				callback(msg, client, message.content, msg.author.id);
				done = true;
				return;
			}

			if (message.embeds.length > 0) {
				message.embeds.forEach((x) => {
					if (x.author != null && regex.test(x.author.url)) {
						callback(msg, client, x.author.url, msg.author.id);
						done = true;
						return;
					}
				});
			}
			count++;
			if (count == 50) {
				msg.channel.send(':no_entry: I couldn\'t find any maps in the last 50 messages');
			}
		})).catch(console.error);

}

module.exports = {
	getMaps: getMaps
};