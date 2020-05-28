/* eslint-disable no-useless-escape */
'use strict';

const request = require('request');
const error = require('../handlers/error');
const map = require('./map');

function beatmapCardFromLink(msg) {
	var beatmapsetid = msg.content.match(/osu.ppy.sh\S+/g)[0];
	beatmapsetid = beatmapsetid.replace('osu.ppy.sh/beatmapsets/', '');
	var beatmapid = beatmapsetid.match(/#\S+/g)[0];
	beatmapid = beatmapid.replace('#osu/', '');
	beatmapid = beatmapid.replace('#mania/', '');
	beatmapid = beatmapid.replace('#taiko/', '');
	beatmapid = beatmapid.replace('#fruits/', '');
	beatmapsetid = beatmapsetid.replace(beatmapsetid.match(/#\S+/g), '');
	getBeatmapData(msg, beatmapsetid, beatmapid);
}

function getBeatmapData(msg, beatmapsetid, beatmapid) {
	request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&s=${beatmapsetid}`, {
		json: true
	}, (err, res, body) => {
		if (body.length == 0) {
			error.log(msg, 4042);
			return;
		}
		var data = {};
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