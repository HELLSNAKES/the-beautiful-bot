const osr = require('node-osr');
const request = require('request');
const recent = require('./recent');

import { Message, Client } from 'discord.js';

import * as score from '../handlers/score';
import * as mods from '../handlers/mods';
import * as error from '../handlers/error';
import * as argument from '../handlers/argument';
import * as utility from '../handlers/utility';

function execute(client: Client, msg: Message, replayFileURL: string) {
	request(replayFileURL, { encoding: null }, (err: any, res: any, body: any) => {
		osr.read(body).then((data: any) => {
			
			if (data.beatmapMD5 == undefined) {
				msg.channel.send(':red_circle: The file could not be parsed correctly because no beatmap hash was found\nThis could be due to a local modification to the map (including a custom difficulty)\nor the beatmap was not submitted to osu! servers');
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
			data = utility.renameKey(data, 'timestamp', 'date');
			data = utility.renameKey(data, 'mods', 'enabled_mods');
			data = utility.renameKey(data, 'playerName', 'username');


			var hidden = mods.toString(data.mods).includes('HD') || mods.toString(data.mods).includes('FL');
			data.rank = score.getRank(options.mode!, hidden, data.count300, data.count100, data.count50, data.countmiss);
			
			recent.processData(client, msg, data, options);


		}).catch((err: Error) => {

			if (err.name == 'RangeError') {
				msg.channel.send(':red_circle: The file could not be parsed correctly because the file is not encoded correctly\nThis could be due to a user modification to the file\nor the file was not generated correctly');
				return;
			}

			error.unexpectedError(err, msg);
		});
	});
}

module.exports = {
	execute: execute
};