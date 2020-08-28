import { IAPIRecent, IAPIBest, IAPIUser } from './interfaces';

export function user(user : any) : IAPIUser {
	return ({
		user_id: user.id,
		username: user.username,
		playcount: user.stats[0].std.playcount,
		total_seconds_played: user.stats[0].std.total_playtime,
		ranked_score: user.stats[0].std.ranked_score,
		total_score: user.stats[0].std.total_score,
		pp_rank: user.stats[0].std.global_leaderboard_rank,
		level: user.stats[0].std.level,
		pp_raw: user.stats[0].std.pp,
		accuracy: user.stats[0].std.accuracy,
		count_rank_ss: '-',
		count_rank_ssh: '-',
		count_rank_s: '-',
		count_rank_sh: '-',
		count_rank_a: '-',
		country: user.country,
		pp_country_rank: user.stats[0].std.country_leaderboard_rank,
		join_date: user.registered_on,
		count300: '-',
		count100: '-',
		count50: '-'
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
			countgeki: scores.scores[i].count_geki,
			perfect: scores.scores[i].full_combo,
			enabled_mods: scores.scores[i].mods,
			user_id: userID,
			date: scores.scores[i].time,
			rank: scores.scores[i].rank
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
			countgeki: scores.scores[i].count_geki,
			perfect: scores.scores[i].full_combo,
			enabled_mods: scores.scores[i].mods,
			user_id: userID,
			date: scores.scores[i].time,
			rank: scores.scores[i].rank,
			pp: scores.scores[i].pp,
			replay_available: '0'
		});
	}
	return (objectArray);
}
