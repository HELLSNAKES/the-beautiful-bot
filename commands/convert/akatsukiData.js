function userData(data) {
	return ({
		user_id: data.id,
		username: data.username,
		playcount: data.std.playcount,
		total_seconds_played: data.std.total_playtime,
		ranked_score: data.std.ranked_score,
		total_score: data.std.total_score,
		pp_rank: data.std.global_leaderboard_rank,
		level: data.std.level,
		pp_raw: data.std.pp,
		accuracy: data.std.accuracy,
		count_rank_ss: '-',
		count_rank_ssh: '-',
		count_rank_s: '-',
		count_rank_sh: '-',
		count_rank_a: '-',
		country: data.country,
		pp_country_rank: data.std.country_leaderboard_rank
	});
}

function recentData(data, dataInfo, index) {
	return ({
		beatmap_id: data.scores[index].beatmap.beatmap_id,
		score: data.scores[index].score,
		maxcombo: data.scores[index].max_combo,
		count50: data.scores[index].count_50,
		count100: data.scores[index].count_100,
		count300: data.scores[index].count_300,
		countmiss: data.scores[index].count_miss,
		countkatu: data.scores[index].count_katu,
		countgeki: data.scores[index].count_geki,
		perfect: data.scores[index].full_combo,
		enabled_mods: data.scores[index].mods,
		user_id: dataInfo.id,
		date: data.scores[index].time,
		rank: data.scores[index].rank,
		accuracy: Math.floor(data.scores[index].accuracy * 100) / 100,
		approved: data.scores[index].beatmap.ranked > 0 && data.scores[index].beatmap.ranked_status_frozen == 0 ? data.scores[index].beatmap.ranked - 1 : 0,
		title: data.scores[index].beatmap.song_name.slice(0, data.scores[index].beatmap.song_name.lastIndexOf('[')),
		version: data.scores[index].beatmap.song_name.slice(data.scores[index].beatmap.song_name.lastIndexOf('[') + 1, data.scores[index].beatmap.song_name.lastIndexOf(']')),
		difficultyrating: Math.round(data.scores[index].beatmap.difficulty * 100) / 100,
		max_combo: data.scores[index].beatmap.max_combo,
		beatmapset_id: data.scores[index].beatmap.beatmapset_id,
		type: 2,
		mode: 0
	});
}


function bestData(data, dataInfo) {
	var objectArray = [];
	for (var i = 0; i < data.scores.length; i++) {
		objectArray.push({
			beatmap_id: data.scores[i].beatmap.beatmap_id,
			score_id: data.scores[i].id,
			score: data.scores[i].score,
			maxcombo: data.scores[i].max_combo,
			count50: data.scores[i].count_50,
			count100: data.scores[i].count_100,
			count300: data.scores[i].count_300,
			countmiss: data.scores[i].count_miss,
			countkatu: data.scores[i].count_katu,
			countgeki: data.scores[i].count_geki,
			perfect: data.scores[i].full_combo,
			enabled_mods: data.scores[i].mods,
			user_id: dataInfo.id,
			date: data.scores[i].time,
			rank: data.scores[i].rank,
			pp: data.scores[i].pp
		});
	}
	return (objectArray);
}

module.exports = {
	userData: userData,
	recentData: recentData,
	bestData: bestData
};