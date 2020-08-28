import { Message } from 'discord.js';
import * as error from '../handlers/error';

const axios = require('axios');

function execute(msg: Message) {
	axios.get('https://api.thecatapi.com/v1/images/search')
		.then((res : any) => {
			msg.reply(res.data[0].url);
			console.log('CAT :3');
		}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});
}

module.exports = {
	name: 'cat',
	description: 'Random cat image',
	group: 'general',
	example: 'https://i.imgur.com/5LzljW7.png',
	execute: execute
};