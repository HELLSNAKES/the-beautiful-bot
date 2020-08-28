require('dotenv').config();

import { Message } from 'discord.js';

const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');

const tests = require('./tests.json');

var currentTest = 0;

client.on('ready', () => {
	client.channels.get(process.env.testingChannelID).send(tests.tests[currentTest].message);
});

client.on('message', (msg : Message) => {
	if (msg.author.id == client.user.id) return;
	
	if (msg.content === tests.tests[currentTest].expected) {
		console.log(chalk.bgGreen(chalk.gray(' PASS ')) + chalk.white(` #${currentTest} : ${tests.tests[currentTest].title}`));
	} else {
		console.log(chalk.bgRed(chalk.gray(' FAIL ')) + chalk.white(` #${currentTest} : ${tests.tests[currentTest].title}`));
		console.log('Expected: ' + (tests.tests[currentTest].expected));
		console.log('Got     : ' + (msg.content));

	}

	currentTest ++;
	if (currentTest == tests.tests.length) {
		console.log(chalk.bgBlue(chalk.gray(' DONE ')));
		process.exit();
	}
	client.channels.get(process.env.testingChannelID).send(tests.tests[currentTest].message);
});


client.login(process.env.testingBotToken);
