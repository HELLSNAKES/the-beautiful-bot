const osr = require('node-osr');
const axios = require('axios');
const recent = require('./recent');

import { Message, Client } from 'discord.js';

import * as score from '../handlers/score';
import * as mods from '../handlers/mods';
import * as error from '../handlers/error';
import * as argument from '../handlers/argument';
import * as utility from '../handlers/utility';

function execute(client: Client, msg: Message, replayFileURL: string) {
	axios({
		method: 'get',
		url: replayFileURL,
		responseType: 'arraybuffer'
	})
		.then((res: any) => {
			osr.read(res.data).then((data: any) => {
				
				if (data.beatmapMD5 == undefined) {
					msg.channel.send(':red_circle: **The file could not be parsed correctly, no beatmap hash was found**\nThis could be due to a local modification to the map (including a custom difficulty)\nor the beatmap was not submitted to osu! servers');
					return;
				}

				var options = argument.parse(msg, []);

				data = utility.renameKey(data, 'number_300s', 'count300');
				data = utility.renameKey(data, 'number_100s', 'count100');
				data = utility.renameKey(data, 'number_50s', 'count50');
				data = utility.renameKey(data, 'misses', 'countmiss');
				data = utility.renameKey(data, 'katus', 'countkatu');
				data = utility.renameKey(data, 'gekis', 'countgeki');
				data = utility.renameKey(data, 'max_combo', 'maxcombo');
				// data = utility.renameKey(data, 'timestamp', 'date');
				data = utility.renameKey(data, 'mods', 'enabled_mods');
				data = utility.renameKey(data, 'playerName', 'username');

				options.mode = data.gameMode;
				// options.type = 1;
				
				var hidden = mods.has(data.enabled_mods, 'HD') || mods.has(data.enabled_mods, 'FL');
				data.rank = score.getRank(options.mode!, hidden, data.count300, data.count100, data.count50, data.countmiss, data.countkatu, data.countgeki);
				
				recent.processData(client, msg, data, options);


			}).catch((err: Error) => {

				if (err.name == 'RangeError') {
					msg.channel.send(':red_circle: **The file could not be encoded correctly\nThis could be due to a user modification to the replay file\nor the replay file was not generated correctly');
					return;
				}

				error.unexpectedError(err, 'Message Content: ' + msg.content);
			});
		}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});
}

module.exports = {
	execute: execute
};