import { IAPIRecent, IAPIBest, IAPIUser } from './interfaces';

export function user(user : any, userGet : any) : IAPIUser {
	return ({
		user_id: user.stats.id,
		username: userGet.users[0].username,
		playcount: user.stats.playcount,
		total_seconds_played: user.stats.playtime,
		ranked_score: user.stats.ranked_score,
		total_score: user.stats.total_score,
		pp_rank: user.stats.rank,
		level: user.stats.level + '.' + user.stats.level_progress,
		pp_raw: user.stats.pp,
		accuracy: user.stats.avg_accuracy,
		count_rank_ss: user.stats.x_count,
		count_rank_ssh: user.stats.xh_count,
		count_rank_s: user.stats.s_count,
		count_rank_sh: user.stats.sh_count,
		count_rank_a: user.stats.a_count,
		country: userGet.users[0].country,
		pp_country_rank: user.stats.country_rank,
		join_date: userGet.users[0].registered_on,
		count300: '-',
		count100: '-',
		count50: '-',
	});
}

export function recent(userID : any, scores : any) : Array<IAPIRecent> {
	var scoreList : any = [];
	
	if (!scores.scores) {
		return scoreList;
	}

	for (var i = 0; i < scores.scores.length; i++) {
		scoreList.push({
			beatmap_id: scores.scores[i].beatmap.beatmap_id,
			score: scores.scores[i].score,
			maxcombo: scores.scores[i].max_combo,
			count50: scores.scores[i].count_50,
			count100: scores.scores[i].count_100,
			count300: scores.scores[i].count_300,
			countmiss: scores.scores[i].count_miss,
			countkatu: scores.scores[i].count_katu,
			countgeki: scores.scores[i].count_gekis,
			perfect: scores.scores[i].full_combo,
			enabled_mods: scores.scores[i].mods,
			user_id: userID,
			date: scores.scores[i].time,
			rank: scores.scores[i].ranking
		});
	}

	return scoreList;
}

export function best(userID : any, scores : any) : Array<IAPIBest> {
	var objectArray : Array<IAPIBest> = [];

	if (!scores.scores) {
		return objectArray;
	}

	for (var i = 0; i < scores.scores.length; i++) {
		objectArray.push({
			beatmap_id: scores.scores[i].beatmap.beatmap_id,
			score_id: scores.scores[i].id,
			score: scores.scores[i].score,
			maxcombo: scores.scores[i].max_combo,
			count50: scores.scores[i].count_50,
			count100: scores.scores[i].count_100,
			count300: scores.scores[i].count_300,
			countmiss: scores.scores[i].count_miss,
			countkatu: scores.scores[i].count_katu,
			countgeki: scores.scores[i].count_gekis,
			perfect: scores.scores[i].full_combo,
			enabled_mods: scores.scores[i].mods,
			user_id: userID,
			date: scores.scores[i].time,
			rank: scores.scores[i].ranking,
			pp: scores.scores[i].pp,
			replay_available: '0'
		});
	}
	return (objectArray);
}
