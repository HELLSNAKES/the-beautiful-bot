'use strict';

const request = require('request');

import { Client } from 'discord.js';

import * as database from '../handlers/database';
import * as pp from '../handlers/pp';

async function execute(client: Client, msg: any) {
	var times: Array<Array<number>> = [
		[new Date(Date.now()).getTime()]
	];

	const message = await msg.channel.send('Pinging');

	request(`https://osu.ppy.sh/api/get_user_recent?${process.env.osuAPI}&u=Moorad`, () => {
		times[0][1] = new Date(Date.now()).getTime();
		times.push([new Date(Date.now()).getTime()]);
		request(`https://the-beautiful-bot-api.herokuapp.com/api/player?osuKey=${process.env.osuAPI}&user=Moorad`, () => {
			times[1][1] = new Date(Date.now()).getTime();
			times.push([new Date(Date.now()).getTime()]);

			pp.calculatepp('1192807', {
				accuracy: 100
			}, () => {
				times[2][1] = new Date(Date.now()).getTime();
				times.push([new Date(Date.now()).getTime()]);
				request('https://api.gatari.pw/user/stats?u=Moorad', () => {
					times[3][1] = new Date(Date.now()).getTime();
					times.push([new Date(Date.now()).getTime()]);
					request('https://akatsuki.pw/api/v1/surprise_me', () => {
						times[4][1] = new Date(Date.now()).getTime();
						database.read('users', {}, (docs) => {
							message.edit(`Discord API Latency is ${Math.round(client.ping)}ms\nosu! API latency is ${times[0][1] - times[0][0]}ms\nTBB API Latency is ${times[1][1] - times[1][0]}ms\nOjsama Latency is ${times[2][1] - times[2][0]}ms\nGatari Latency is ${times[3][1] - times[3][0]}ms\nAkatsuki Latency is ${times[4][1] - times[4][0]}ms\n\nNumber of servers: ${client.guilds.size}\nNumber of users: ${docs.length}`);
						});

					});

				});
			});
		});

	});
}

module.exports = {
	name: 'ping',
	description: 'Measures the latency of the APIs that TBB uses',
	group: 'general',
	execute: execute
};