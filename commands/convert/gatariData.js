function userData(data, dataInfo) {
	console.log(dataInfo)
	return ({
		user_id: data.stats.id,
		username: dataInfo.users[0].username,
		playcount: data.stats.playcount,
		total_seconds_played: data.stats.playtime,
		ranked_score: data.stats.ranked_score,
		total_score: data.stats.total_score,
		pp_rank: data.stats.rank,
		level: parseFloat(data.stats.level + "." + data.stats.level_progress),
		pp_raw: data.stats.pp,
		accuracy: data.stats.avg_accuracy,
		count_rank_ss: data.stats.x_count,
		count_rank_ssh: data.stats.xh_count,
		count_rank_s: data.stats.s_count,
		count_rank_sh: data.stats.sh_count,
		count_rank_a: data.stats.a_count,
		country: dataInfo.users[0].country,
		pp_country_rank: data.stats.country_rank
	})
}

function bestData(data, dataInfo) {
	console.log(data.scores[0].beatmap)
	var objectArray = []
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
			countgeki: data.scores[i].count_gekis,
			perfect: data.scores[i].full_combo,
			enabled_mods: data.scores[i].mods,
			user_id: dataInfo.users[0].id,
			date: data.scores[i].time,
			rank: data.scores[i].ranking,
			pp: data.scores[i].pp
		})
	}
	return (objectArray);
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
		countgeki: data.scores[index].count_gekis,
		perfect: data.scores[index].full_combo,
		enabled_mods: data.scores[index].mods,
		user_id: dataInfo.users[0].id,
		date: data.scores[index].time,
		rank: data.scores[index].ranking,
		accuracy: Math.floor(data.scores[index].accuracy * 100)/100,
		approved: data.scores[index].beatmap.ranked > 0 && data.scores[index].beatmap.ranked_status_frozen == 0 ? data.scores[index].beatmap.ranked - 1 : 0,
		title: data.scores[index].beatmap.song_name.slice(0,data.scores[index].beatmap.song_name.lastIndexOf('[')),
		version:data.scores[index].beatmap.song_name.slice(data.scores[index].beatmap.song_name.lastIndexOf('[')+1,data.scores[index].beatmap.song_name.lastIndexOf(']')),
		difficultyrating: Math.round(data.scores[index].beatmap.difficulty*100)/100,
		max_combo: data.scores[index].beatmap.fc,
		beatmapset_id: data.scores[index].beatmap.beatmapset_id,
		type:1,
		mode:0
	})
}

module.exports = {
	userData: userData,
	bestData: bestData,
	recentData: recentData
}