'use strict';

import { Message } from 'discord.js';

const request = require('request');

function execute(msg: Message) {
	request('https://api.thecatapi.com/v1/images/search', function (err: any, res: any, body: any) {
		msg.reply(JSON.parse(body)[0].url);
		console.log('CAT :3');
	});
}

module.exports = {
	name: 'cat',
	description: 'Random cat image',
	group: 'general',
	example: 'https://imgur.com/DxU8nji.jpg',
	execute: execute
};