const axios = require('axios');

import { Client } from 'discord.js';

import * as database from '../handlers/database';
import * as pp from '../handlers/pp';

async function execute(client: Client, msg: any) {

	const responsePromise = (request: Promise<any>) => {
		return new Promise((resolve, reject) => {
			const initalDate = new Date(Date.now()).getTime();
			request
				.then(() => { resolve(new Date(Date.now()).getTime() - initalDate); })
				.catch((err) => { reject(err); });
		});
	};

	const message = await msg.channel.send(':blue_circle: **Pinging**');

	var promises = [
		new Promise((resolve) => { resolve(client.ping); }),
		responsePromise(axios.get(`https://osu.ppy.sh/api/get_user_recent?k=${process.env.osuAPI}&u=Moorad`)),
		responsePromise(axios.get('https://the-beautiful-bot-api.herokuapp.com/ping')),
		responsePromise(new Promise((resovle) => { pp.calculatepp('1192807', { accuracy: 100 }, () => { resovle(); }); })),
		responsePromise(axios.get('https://api.gatari.pw/user/stats?u=Moorad')),
		responsePromise(axios.get('https://akatsuki.pw/api/v1/surprise_me')),
		responsePromise(database.read('users', {}, { useCache: false })),
	];

	const allSettled = (promise: Promise<any>) => {
		return promise.then(
			(value) => { return { status: 'fulfilled', value: value }; },
			(err) => { return { status: 'rejected', reason: err }; }
		);
	};

	Promise.all(promises.map(allSettled))
		.then((values: any) => {
			const constructString = (err: Error | undefined, docs: any) => {
				var string = '';
				string += 'Discord API: ' + (values[0].status == 'fulfilled' ? `**OK** (${values[0].value ?? ''}ms)` : '**FAILED**');
				string += '\nosu! API: ' + (values[1].status == 'fulfilled' ? `**OK** (${values[1].value ?? ''}ms)` : '**FAILED**');
				string += '\nTBB API: ' + (values[2].status == 'fulfilled' ? `**OK** (${values[2].value ?? ''}ms)` : '**FAILED**');
				string += '\nOjsama: ' + (values[3].status == 'fulfilled' ? `**OK** (${values[3].value ?? ''}ms)` : '**FAILED**');
				string += '\nGatari: ' + (values[4].status == 'fulfilled' ? `**OK** (${values[4].value ?? ''}ms)` : '**FAILED**');
				string += '\nAkatsuki: ' + (values[5].status == 'fulfilled' ? `**OK** (${values[5].value ?? ''}ms)` : '**FAILED**');
				string += '\nDatabase: ' + (values[6].status == 'fulfilled' ? `**OK** (${values[6].value ?? ''}ms)` : '**FAILED**');
				string += '\n\nNumber of servers: ' + client.guilds.size;
				string += '\nNumber of users: ' + (!err ? docs.length : '**FAILED**');
				message.edit(string);
			};

			database.read('users', {}, { useCache: false })
				.then((docs) => constructString(undefined, docs))
				.catch((err) => constructString(err, undefined));
		});
}

module.exports = {
	name: 'ping',
	description: 'Measures the latency of the APIs that TBB uses',
	group: 'general',
	example: 'https://i.imgur.com/kS3UmsF.png',
	execute: execute
};