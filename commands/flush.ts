import { flush } from '../handlers/cache';
import { preCache } from '../index';
import { Message } from 'discord.js';

function execute(msg : Message) {
	if (msg.author.id != process.env.ownerID) {
		msg.channel.send(':red_circle: **User does not have developer permissions**\nYou must be the owner of the bot to be able to flush the cache');
		return;
	}

	flush().then(() => {
		preCache();
		msg.channel.send(':green_circle: **The database cache has been flushed and recached successfully**');
	}).catch((err) => {throw err;});
}

module.exports = {
	name: 'flush',
	execute: execute
};