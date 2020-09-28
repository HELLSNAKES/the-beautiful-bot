import * as database from '../handlers/database';
import * as error from '../handlers/error';
import * as score from '../handlers/score';
import * as argument from '../handlers/argument';
import * as beatmap from '../handlers/beatmap';

import { Message, Emoji } from 'discord.js';

const axios = require('axios');
const tbbpp = require('tbbpp');

function execute(msg: Message, args: Array<string>) {

	if (!msg.member.hasPermission('ADMINISTRATOR')) {
		msg.channel.send(':red_circle: **User does not have administrator permissions**\nYou must have adminstrator permissions to be able to set or remove this channel\'s map feed');
		return;
	}

	if (args[0] == 'set') {
		database.read('servers', { serverID: msg.guild.id }, {})
			.then((docs) => {
				if (docs.length == 0 || docs[0].mapFeedChannelID == undefined) {
					database.write('servers', { serverID: msg.guild.id, mapFeedChannelID: msg.channel.id }, {})
						.then(() => {
							msg.channel.send(':green_circle: **The map feed has been successfully set to this channel**');
						}).catch(err => error.unexpectedError(err, 'Tried writing a new prefix'));

				} else {
					database.update('servers', { serverID: msg.guild.id }, { mapFeedChannelID: msg.channel.id }, {})
						.then(() => {
							msg.channel.send(':green_circle: **The map feed has been successfully updated to this channel**');
						}).catch(err => error.unexpectedError(err, 'Tried updating prefix'));

				}
			}).catch(err => error.unexpectedError(err, 'Tried reading database to set mapfeed'));
	} else if (args[0] == 'remove') {

		database.read('servers', { serverID: msg.guild.id }, {})
			.then((docs) => {
				if (docs.length == 0) {
					msg.channel.send(':yellow_circle: **The map feed cannot be removed from a channel with no map feed**');
					return;
				}

				database.update('servers', { serverID: msg.guild.id }, { mapFeedChannelID: '' }, { unset: true })
					.then(() => {
						msg.channel.send(':green_circle: **The map feed has been successfully removed from this channel**');
					}).catch(err => error.unexpectedError(err, 'Tried unsetting mapfeed'));
			}).catch(err => error.unexpectedError(err, 'Tried reading database to remove mapfeed'));
	} else {
		msg.channel.send(`:red_circle: **\`${args[0]}\` is not a valid option.**\nUse \`$help mapfeed\` to see available options`);
	}
}

function sendFeed(client: any) {
	database.read('utility', {}, { useCache: false, noLogs: true })
		.then((docs) => {
			const lastChecked = docs[0].lastChecked;
			database.read('servers', {}, { useCache: false, noLogs: true })
				.then((docs) => {
					docs = docs.filter((x: any) => x.mapFeedChannelID != undefined);

					axios.get('https://osu.ppy.sh/beatmapsets/search')
						.then((res: any) => {
							// filter plays that are older than lastChecked
							res.data = res.data.beatmapsets.filter((x: any) => new Date(x.ranked_date).getTime() > lastChecked!);

							// Cut down the size of the array to 5 to prevent the bot from spamming maps after going online
							if (res.data.length > 5) {
								res.data = res.data.slice(0, 5);
							}

							// The body at this point is from newest to oldest. We want to reverse that to oldest to newest
							res.data.reverse();

							const promises = res.data.map((data: any) => axios.get(`https://osu.ppy.sh/osu/${data.beatmaps[0].id}`));

							Promise.all(promises)
								.then((values: any) => {
									for (var i = 0; i < docs.length; i++) {
										for (var j = 0; j < res.data.length; j++) {
											var body = res.data[j];
											var osuContent = tbbpp.processContent(values[j].data);

											try {
												var BPM = beatmap.getVariableBPM(body.bpm, osuContent.bpmMin, osuContent.bpmMax, osuContent.timingPoints, osuContent.totalTime);
											} catch {
												BPM = body.bpm;
											}
											let status = client.emojis.find((emoji: Emoji) => emoji.name === 'status_' + body.ranked);

											const embed = {
												'title': `${body.artist} - ${body.title}`,
												'url': `https://osu.ppy.sh/s/${body.id}`,
												'description': `${status} ${body.status != 'ranked' ? body.status != 'loved' ? 'Approved' : 'Loved' : 'Ranked'}\nBPM: \`${BPM}\``,
												'image': {
													'url': body.covers['cover@2x']
												},
												'author': {
													'name': `Mapped by ${body.creator}`,
													'url': `https://osu.ppy.sh/u/${body.user_id}`,
													'icon_url': `https://a.ppy.sh/${body.user_id}?${Date.now().toString()}.png`
												}
											};
											embed.description += ' | Length: `' + (Math.floor(body.beatmaps[0].total_length / 60) + ':' + (body.beatmaps[0].total_length % 60 < 10 ? '0' + (body.beatmaps[0].total_length % 60) : body.beatmaps[0].total_length % 60)) + '`\n';
											body.beatmaps.sort((a: any, b: any) => a.difficulty_rating - b.difficulty_rating);
											embed.description += `[${body.beatmaps[body.beatmaps.length - 1].version}] ★: \`${body.beatmaps[body.beatmaps.length - 1].difficulty_rating}\`${body.beatmaps[body.beatmaps.length - 1].max_combo ? ' | combo: `' + body.beatmaps[body.beatmaps.length - 1].max_combo + 'x`' : ''}\n`;
											for (var k = 0; k < body.beatmaps.length; k++) {
												const diffIcon = client.emojis.find((emoji: any) => emoji.name === score.getDifficultyName(0, body.beatmaps[k].difficulty_rating) + '_' + body.beatmaps[k].mode);
												embed.description += diffIcon + ' ';
											}
											client.channels.get(docs[i].mapFeedChannelID).send({ embed });
										}
									}
								});

							database.update('utility', { lastChecked: lastChecked }, {
								lastChecked: new Date(Date.now()).getTime()
							}, { useCache: false, noLogs: true })
								.catch((err: Error) => error.unexpectedError(err, 'Attempted to request maps from osu for map feed'));
						}).catch((err: Error) => error.unexpectedError(err, 'Attempted to request maps from osu for map feed'));
				}).catch(err => error.unexpectedError(err, 'Error while retriving mapFeedChannelIDs from the database'));
		}).catch(err => error.unexpectedError(err, 'Retriving lastChecked from the database'));
}

module.exports = {
	name: 'mapfeed',
	description: 'Add or remove a map feed to the current channel',
	group: 'osu',
	arguments: argument.getOtherArgumentDetails(['Action ']),
	sendFeed: sendFeed,
	execute: execute
};