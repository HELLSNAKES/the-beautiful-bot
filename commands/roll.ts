import { Message } from 'discord.js';
import * as argument from '../handlers/argument';

function execute(msg: Message, args : any) {
	
	var number = 100;

	
	if (args.length > 0 && !isNaN(args[0])) {
		number = Math.floor(Number(args[0]));
	} else if (args.length > 0 && isNaN(args[0])) {
		msg.channel.send(`:red_circle: \`${args[0]}\` is not a valid number`);
		console.log(`ROLL : ${msg.author.id}`);
		return;
	}

	msg.channel.send(`:blue_circle: ${msg.author.username} rolls ${Math.ceil(Math.random() * number)} point(s)`);
	console.log(`ROLL : ${msg.author.id}`);
}

module.exports = {
	name: 'roll',
	description: 'Draws a random number from 1 to the selected number',
	group: 'osu',
	arguments: argument.getOtherArgumentDetails(['Number']),
	example: 'https://i.imgur.com/FV3G8uK.png',
	execute: execute
};