'use strict';

import { Client, Message } from 'discord.js';

export function getMaps(client: Client, msg: Message, callback: (client: Client, msg: Message, url: string, id: string) => void = (): void => { }): void {
	let done = false;
	let regex = new RegExp('https://osu.ppy.sh/beatmapsets/[0-9]+#osu/[0-9]+', 'g');
	let count = 0;
	msg.channel.fetchMessages()
		.then(messages => messages.forEach((message) => {
			if (done) return;

			if (regex.test(message.content)) {
				callback(client, msg, message.content, msg.author.id);
				done = true;
				return;
			}

			if (message.embeds.length > 0) {
				message.embeds.forEach((x) => {
					if (x.author != null && regex.test(x.author.url)) {
						callback(client, msg, x.author.url, msg.author.id);
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