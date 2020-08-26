/* eslint-disable no-useless-escape */
import { Message } from 'discord.js';

import * as error from '../handlers/error';
import * as API from '../handlers/API';

const map = require('./map');

function beatmapCardFromLink(msg: any) {
	if (msg.content.match(/osu.ppy.sh\/beatmapsets\/\d+#([A-Za-z0-9]+)\/\d+/g)) {
		getBeatmapsetData(msg, msg.content.slice(msg.content.indexOf('beatmapsets/') + 11 + 1, msg.content.indexOf('#')), msg.content.slice(msg.content.lastIndexOf('/') + 1));
	} else if (msg.content.match(/osu.ppy.sh\/beatmapsets\/\d+/g)) {
		getBeatmapsetData(msg, msg.content.slice(msg.content.indexOf('beatmapsets/') + 11 + 1), undefined);
	} else if (msg.content.match(/osu.ppy.sh\/b\/\d+/g)) {
		getBeatmapData(msg, msg.content.slice(msg.content.lastIndexOf('/') + 1));
	} else if (msg.content.match(/osu.ppy.sh\/s\/\d+/g)) {
		getBeatmapsetData(msg, msg.content.slice(msg.content.lastIndexOf('/') + 1), undefined);
	}
}

function getBeatmapsetData(msg: Message, beatmapsetid: string | undefined, beatmapid: string | undefined) {
	API.getBeatmap({
		beatmapSetID: beatmapsetid
	}).then((res: any) => {

		if (res == undefined || res.length == 0) {
			error.unexpectedError(new Error('Unexpected empty or undefined response body'), `https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&s=${beatmapsetid}`);
			return;
		}
		
		// If no beatmap is specified, set beatmap id to the hardest difficulty 
		// Cannot use the last index because osu's API seems to return beatmap difficulties in a random order
		if (beatmapid == undefined) {
			var highestIndex = 0;
			for (var i = 0; i < res.length; i++) {
				if (res[i].difficultyrating > res[highestIndex].difficultyrating) highestIndex = i;
			}
			beatmapid = res[highestIndex].beatmap_id;
		}

		var data: any = {};
		data.beatmaps = [];
		var modes = ['osu', 'taiko', 'fruits', 'mania'];
		for (i = 0; i < res.length; i++) {

			res[i].mode = modes[res[i].mode];
			res[i].difficulty_rating = res[i].difficultyrating;
			data.beatmaps.push(res[i]);
			if (res[i].beatmap_id == beatmapid) {
				data = {
					...res[i],
					...data
				};
			}
		}

		var approved;
		if (data.approved == -2) approved = 'graveyard';
		else if (data.approved == -1) approved = 'WIP';
		else if (data.approved == 0) approved = 'pending';
		else if (data.approved == 1) approved = 'ranked';
		else if (data.approved == 2) approved = 'approved';
		else if (data.approved == 3) approved = 'qualified';
		else if (data.approved == 4) approved = 'loved';

		data = {
			...data,
			id: data.beatmapset_id,
			user_id: data.creator_id,
			url: 'https://osu.ppy.sh/beatmapsets/' + beatmapsetid + '#osu/' + beatmapid,
			status: approved,
			beatmap: {
				id: data.beatmap_id,
				difficulty_rating: data.difficultyrating,
				cs: data.diff_size,
				ar: data.diff_approach,
				drain: data.diff_drain,
				accuracy: data.diff_overall,
				max_combo: data.max_combo,
				total_length: data.total_length,
				version: data.version
			}
		};

		console.log(`BEATMAP DATA : ${msg.author.id} : https://osu.ppy.sh/beatmapsets/${beatmapsetid}#osu/${beatmapid}`);
		if (msg) {
			map.generateBeatmap(msg, data);
		} else {
			return (data);
		}

	}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});
}

function getBeatmapData(msg: Message, beatmapid: string | undefined) {
	API.getBeatmap({
		beatmapID: beatmapid
	}).then((res: any) => {
		getBeatmapsetData(msg, res[0].beatmapset_id, beatmapid);
	}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});
}

module.exports = {
	beatmapCardFromLink: beatmapCardFromLink
};