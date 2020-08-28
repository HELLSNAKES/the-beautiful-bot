import { Client, Message } from 'discord.js';
import { IOptions, IURLParserBeatmap } from '../handlers/interfaces';

import * as argument from '../handlers/argument';
import * as getMaps from '../handlers/getMap';
import * as error from '../handlers/error';
import * as mods from '../handlers/mods';
import * as API from '../handlers/API';
import * as utility from '../handlers/utility';
import * as score from '../handlers/score';

const recent = require('./recent');

function execute(client: Client, msg: Message, args: Array<string>) {
	getMaps.getMaps(client, msg, function (client, msg, URLData) {
		argument.determineUser(msg, args, (username, options) => {
			options.mode = URLData.ruleset;
			utility.checkUser(username!, options.type)
				.then((userID) => {
					sendCompareEmbed(client, msg, URLData, userID, username, options);
				}).catch((err) => {
					if (err.message == 'No user with the specified username/user id was found') {
						msg.channel.send(`:red_circle: **The username \`${username}\` is not valid**\nThe username used or linked does not exist on the \`${score.getServer(String(options.type))}\` servers. Try using the id of the user instead of the username`);
					} else {
						error.sendUnexpectedError(err, msg);
					}
				});
		});
	});
}

function sendCompareEmbed(client: Client, msg: Message, URLData: IURLParserBeatmap, userID: string | undefined, username : string | undefined, options: IOptions) {

	if (options.type == 2) {
		msg.channel.send(':red_circle: **`$c` is not supported for Akatsuki users yet**');
	}

	API.getScore(userID!, URLData.beatmapID!, options.mode, options.type)
		.then((res: any) => {

			API.getBeatmap({
				beatmapID: URLData.beatmapID,
				converted: true,
				ruleset: options.mode
			}).then((resBeatmap : any) => {

				if (res.length == 0) {
					msg.channel.send(`:yellow_circle: **\`${username}\` does not have any submitted scores on \`${resBeatmap[0].artist} - ${resBeatmap[0].title} [${resBeatmap[0].version}]\`**`);
					return;
				}
		
				var index = 0;

				if (options!.mods != undefined) {
					for (var i = 0; i < res.length; i++) {
						if (mods.toString(res[i].enabled_mods) == options!.mods![1]) {
							index = i;
							break;
						}
					}
				}
		
				res[index].otherComparePlays = res.filter((x : any) => x.enabled_mods != res[index].enabled_mods).map((x : any) => x.enabled_mods);

				res = {
					...res[index],
					...resBeatmap[0]
				};
				
				res.pp = Math.floor(res.pp * 100) / 100;

				options.mode = res.mode;

				recent.processData(client, msg, res, options);
				console.log(`COMPARE : ${msg.author.id} : https://osu.ppy.sh/users/${res.user_id}`);
			}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});
		}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});

}

module.exports = {
	name: 'compare',
	description: 'Compares your play/specified play with the last mentioned play',
	aliases: ['c'],
	group: 'osu',
	arguments: argument.getOtherArgumentDetails(['Username']),
	example: 'https://i.imgur.com/QQLprUk.png',
	execute: execute
};