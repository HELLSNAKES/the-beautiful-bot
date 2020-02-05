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
		level:	parseFloat(data.stats.level+"."+data.stats.level_progress),
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
	objectArray = []
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
	return(objectArray);
}

module.exports = {
	userData: userData,
	bestData: bestData
}