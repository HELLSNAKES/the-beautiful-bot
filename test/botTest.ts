<<<<<<< HEAD
=======
require('dotenv').config();

>>>>>>> adf7f00fada7b94997123bbb380c1e7375447360
import { Message } from 'discord.js';

const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');

const tests = require('./tests.json');
<<<<<<< HEAD
const channelID = '687655592135098381';
const testBotToken = 'Njk5NjE1NjIxMjU5NzIyODQx.XwbjtA.MR_daRPivZIxP-v7va6JPMQjIdE';
=======
>>>>>>> adf7f00fada7b94997123bbb380c1e7375447360

var currentTest = 0;

client.on('ready', () => {
<<<<<<< HEAD
	client.channels.get(channelID).send(tests.tests[currentTest].message);
=======
	client.channels.get(process.env.testingChannelID).send(tests.tests[currentTest].message);
>>>>>>> adf7f00fada7b94997123bbb380c1e7375447360
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
<<<<<<< HEAD
	client.channels.get(channelID).send(tests.tests[currentTest].message);
});


client.login(testBotToken);
=======
	client.channels.get(process.env.testingChannelID).send(tests.tests[currentTest].message);
});


client.login(process.env.testingBotToken);
>>>>>>> adf7f00fada7b94997123bbb380c1e7375447360
