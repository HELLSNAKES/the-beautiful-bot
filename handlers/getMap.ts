import { Client, Message } from 'discord.js';
import { IURLParserBeatmap } from './interfaces';

import * as parser from './parser';

export function getMaps(client: Client, msg: Message, callback: (client: Client, msg: Message, parserData: IURLParserBeatmap, id: string) => void = (): void => { }): void {
	let done = false;
	let count = 0;
	msg.channel.fetchMessages()
		.then(messages => messages.forEach((message) => {
			if (done) return;

			var URLData = parser.beatmapURL(message.content);
			if (URLData.valid) {
				callback(client, msg, URLData, msg.author.id);
				done = true;
				return;
			}

			if (message.embeds.length > 0) {
				message.embeds.forEach((x) => {
					if (x.author != null) {
						URLData = parser.beatmapURL(x.author.url);
						if (URLData.valid) {

							if (x.author.name.startsWith('(osu)')) URLData.ruleset = 0;
							else if (x.author.name.startsWith('(Taiko)')) URLData.ruleset = 1;
							else if (x.author.name.startsWith('(Catch)')) URLData.ruleset = 2;
							else if (x.author.name.startsWith('(Mania)')) URLData.ruleset = 3;

							callback(client, msg, URLData, msg.author.id);
							done = true;
							return;
						}
					}
				});
			}
			count++;
			if (count == 50) {
				msg.channel.send(':yellow_circle: No maps were found in the last 50 messages');
			}
		})).catch(console.error);

}