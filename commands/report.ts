import { Message } from 'discord.js';
import * as argument from '../handlers/argument';

const axios = require('axios');

const slackMessageTemplate :any = {
	attachments: [
		{
			color: '#f2c744',
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: '*Bug or suggestion by user*'
					}
				},
				{
					type: 'divider'
				},
				{
					type: 'section',
					text: {
						type: 'plain_text',
						text: 'Details:'
					}
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: '```Code```'
					}
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: '```Code```'
					}
				}
			]
		}
	]
};

function execute(msg : Message, args : Array<string>) {
	if (process.env.slackAPI) {
		slackMessageTemplate.attachments[0].blocks[3].text.text = '```' + args.join(' ') + '```';
		slackMessageTemplate.attachments[0].blocks[4].text.text = '```Discord ID: ' + msg.author.id + '```';

		axios.post(process.env.slackAPI, slackMessageTemplate).then(() => {
			msg.channel.send(':green_circle: **Your bug or suggestion has been submitted successfully**');
		}).catch(console.error);

	} else {
		console.error('Slack Incoming Webhook URL was not found in the Environment Variables');
	}
}

module.exports = {
	name: 'report',
	description: 'Report a bug or suggest a feature/change',
	group: 'moderation',
	arguments: argument.getOtherArgumentDetails(['Message']),
	example: 'https://i.imgur.com/sjM50w4.png',
	execute: execute
};