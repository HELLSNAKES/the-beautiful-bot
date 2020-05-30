import { IAPIRecent, IAPIBest, IAPIUser } from './interfaces';

export function user(user : any) : IAPIUser {
	return ({
		user_id: user.id,
		username: user.username,
		playcount: user.std.playcount,
		total_seconds_played: user.std.total_playtime,
		ranked_score: user.std.ranked_score,
		total_score: user.std.total_score,
		pp_rank: user.std.global_leaderboard_rank,
		level: user.std.level,
		pp_raw: user.std.pp,
		accuracy: user.std.accuracy,
		count_rank_ss: '-',
		count_rank_ssh: '-',
		count_rank_s: '-',
		count_rank_sh: '-',
		count_rank_a: '-',
		country: user.country,
		pp_country_rank: user.std.country_leaderboard_rank,
		join_date: user.registered_on,
		count300: '-',
		count100: '-',
		count50: '-'
	});
}

export function recent(user : any, scores : any,index : number) : IAPIRecent {
	return ({
		beatmap_id: scores.scores[index].beatmap.beatmap_id,
		score: scores.scores[index].score,
		maxcombo: scores.scores[index].max_combo,
		count50: scores.scores[index].count_50,
		count100: scores.scores[index].count_100,
		count300: scores.scores[index].count_300,
		countmiss: scores.scores[index].count_miss,
		countkatu: scores.scores[index].count_katu,
		countgeki: scores.scores[index].count_geki,
		perfect: scores.scores[index].full_combo,
		enabled_mods: scores.scores[index].mods,
		user_id: user.id,
		date: scores.scores[index].time,
		rank: scores.scores[index].rank
	});
}

export function best(user : any, scores : any) : Array<IAPIBest> {
	var objectArray : Array<IAPIBest> = [];
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
			user_id: user.id,
			date: scores.scores[i].time,
			rank: scores.scores[i].rank,
			pp: scores.scores[i].pp,
			replay_available: '0'
		});
	}
	return (objectArray);
}
