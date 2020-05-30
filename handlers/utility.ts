'use strict';

import { Message } from 'discord.js';
import { IDBUser } from './interfaces';

const request = require('request');
const error = require('../handlers/error');

export function checkUser(msg: Message, data: IDBUser, callback: (data: any) => {}): void {
	request(`https://osu.ppy.sh/api/get_user?k=${process.env.osuAPI}&u=${data.osuUsername}`, {
		json: true
	}, (err: any, res: any, body: Array<object>) => {
		if (body.length == 0) {
			error.log(msg, 4041);
			return;
		} else {
			msg.channel.send('**Your osu Username has been successfully connected!**\nType `$help` to see the list of commands available');
			callback(data);
		}
	});
}