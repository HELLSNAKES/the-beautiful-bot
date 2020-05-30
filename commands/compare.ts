'use strict';

import { Client, Message } from 'discord.js';
import { IOptions } from '../handlers/interfaces';

import * as argument from '../handlers/argument';
import * as getMaps from '../handlers/getMap';

const request = require('request');
const recent = require('./recent');

function execute(client: Client, msg: Message, args: Array<string>) {
	getMaps.getMaps(client, msg, function (client, msg, url) {
		argument.determineUser(msg, args, (username, options) => {
			sendCompareEmbed(client, msg, url, username, options);
		});
	});
}

function sendCompareEmbed(client: Client, msg: Message, url: string, username: string | undefined, options: IOptions) {
	if (options.type == 0) {
		request(`https://osu.ppy.sh/api/get_scores?k=${process.env.osuAPI}&u=${username}&b=${url.slice(url.indexOf('#osu/') + 5)}`, (err: any, res: any, body: any) => {
			body = JSON.parse(body);

			request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${url.slice(url.indexOf('#osu/') + 5)}`, {
				json: true
			}, (err: any, res: any, beatmapData: any) => {
				if (err) console.log(err);

				body = {
					...body[0],
					...beatmapData[0]
				};
				body.pp = Math.floor(body.pp * 100) / 100;
				if (body.user_id == undefined) {
					msg.channel.send(`Sorry but I couldn't find any plays on \`${beatmapData[0].title} [${beatmapData[0].version}].\``);
					return;
				}
				recent.processData(client, msg, body, body.mode);
				console.log(`COMPARE : ${msg.author.id} : https://osu.ppy.sh/users/${body.user_id}`);
			});
		});
	} else {
		msg.channel.send(':no_entry: Sorry but private servers are not supported on $compare/$c yet');
	}
}

module.exports = {
	name: 'compare',
	description: 'Compares your play/specified play with the last mentioned play',
	aliases: ['c'],
	group: 'osu',
	arguments: argument.getOtherArgumentDetails(['Username']),
	example: 'https://i.imgur.com/GkL4mJV.jpg',
	execute: execute
};