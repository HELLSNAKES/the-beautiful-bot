'use strict';

const request = require('request');

import { Client } from 'discord.js';

import * as database from '../handlers/database';
import * as pp from '../handlers/pp';

async function execute(client: Client, msg: any) {
	var timeDifference : Array<number> = []; 
	var values : Array<string> = [];
	var responseStatus = (err : any) => {
		timeDifference[1] = new Date(Date.now()).getTime();
		values.push('**OK** (' + (timeDifference[1] - timeDifference[0]) + 'ms)');
		if (err) values[values.length - 1] = '**FAILED**';
		timeDifference[0] = new Date(Date.now()).getTime();
	};
	const message = await msg.channel.send(':blue_circle: **Pinging**');

	timeDifference[0] = new Date(Date.now()).getTime();
	request(`https://osu.ppy.sh/api/get_user_recent?${process.env.osuAPI}&u=Moorad`, (err : Error) => {
		responseStatus(err);

		request(`https://the-beautiful-bot-api.herokuapp.com/api/player?osuKey=${process.env.osuAPI}&user=Moorad`, (err : Error) => {
			responseStatus(err);

			pp.calculatepp('1192807', {
				accuracy: 100
			}, () => {
				responseStatus(err);

				request('https://api.gatari.pw/user/stats?u=Moorad', (err : Error) => {
					responseStatus(err);

					request('https://akatsuki.pw/api/v1/surprise_me', (err : Error) => {
						responseStatus(err);

						database.read('users', {}, (docs, err) => {
							responseStatus(err);

							message.edit(`Discord API: **OK** (${Math.round(client.ping)}ms)\nosu! API: ${values[0]}\nTBB API: ${values[1]}\nOjsama: ${values[2]}\nGatari: ${values[3]}\nAkatsuki: ${values[4]}\n\nNumber of servers: ${client.guilds.size}\nNumber of users: ${docs.length}`);
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