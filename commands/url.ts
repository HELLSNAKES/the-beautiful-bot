/* eslint-disable no-useless-escape */
'use strict';

import { Message } from 'discord.js';

// import * as error from '../handlers/error'; // Might be used again soon

const request = require('request');
const map = require('./map');

function beatmapCardFromLink(msg: any) {
	if (msg.content.match(/osu.ppy.sh\/beatmapsets\/\d+#([A-Za-z0-9]+)\/\d+/g)) {
		getBeatmapData(msg, msg.content.slice(msg.content.lastIndexOf('/') + 1), undefined);
	} else if (msg.content.match(/osu.ppy.sh\/beatmapsets\/\d+/g)) {
		getBeatmapData(msg, undefined, msg.content.slice(msg.content.lastIndexOf('/') + 1));
	} else if (msg.content.match(/osu.ppy.sh\/b\/\d+/g)) {
		getBeatmapData(msg, msg.content.slice(msg.content.lastIndexOf('/') + 1), undefined);
	} else if (msg.content.match(/osu.ppy.sh\/s\/\d+/g)) {
		getBeatmapData(msg, undefined, msg.content.slice(msg.content.lastIndexOf('/') + 1));
	}
}

function getBeatmapData(msg: Message, beatmapid: string | undefined, beatmapsetid: string | undefined) {
	request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&${beatmapid ? 'b=' + beatmapid : 's=' + beatmapsetid}`, {
		json: true
	}, (err: any, res: any, body: any) => {
		if (body.length == 0) {
			return;
		}

		if (beatmapid == undefined) beatmapid = body[body.length - 1].beatmap_id;

		var data: any = {};
		data.beatmaps = [];
		var modes = ['osu', 'taiko', 'fruits', 'mania'];
		for (var i = 0; i < body.length; i++) {

			body[i].mode = modes[body[i].mode];
			body[i].difficulty_rating = body[i].difficultyrating;
			data.beatmaps.push(body[i]);
			if (body[i].beatmap_id == beatmapid) {
				data = {
					...body[i],
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

	});
}

module.exports = {
	beatmapCardFromLink: beatmapCardFromLink
};