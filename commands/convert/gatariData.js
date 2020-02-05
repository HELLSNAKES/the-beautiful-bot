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

module.exports = {
	userData: userData
}