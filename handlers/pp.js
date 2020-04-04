/* eslint-disable no-useless-escape */
const mods = require('./mods');
const ojsama = require('ojsama');
const request = require('request');

function calculatepp(beatmapId, options, callback = () => {}) {

	var parser = new ojsama.parser();

	request({
		url: `https://osu.ppy.sh/osu/${beatmapId}`,
		encoding: null
	}, (res, err, body) => {
		parser.feed(body.toString());

		var params = {
			map: parser.map
		};
		if (options.mods) params.mods = options.mods;
		if (options.accuracy) params.acc_percent = options.accuracy;
		if (options.combo) params.combo = options.combo;
		if (options.misses) params.nmiss = options.misses;
		if (options.mode) params.mode = options.mode;
		options.combo = (options.combo ? options.combo : parser.map.max_combo());
		options.accuracy = (options.accuracy ? options.accuracy : 100);
		options.mods = (options.mods ? options.mods : 0);
		var output = ojsama.ppv2(params);

		params.nmiss = 0;
		params.combo = parser.map.max_combo();
		var FC = ojsama.ppv2(params);

		var stats = new ojsama.std_beatmap_stats(parser.map);
		stats = stats.with_mods(options.mods);
		var stars = new ojsama.diff().calc({
			map: parser.map,
			mods: options.mods
		});

		var jsonOutput = {
			error: null,
			beatmapId: beatmapId,
			title: parser.map.title,
			artist: parser.map.artist,
			difficultyName: parser.map.version,
			creator: parser.map.creator,
			AR: Math.floor(stats.ar * 100) / 100,
			OD: Math.floor(stats.od * 100) / 100,
			CS: Math.floor(stats.cs * 100) / 100,
			HP: Math.floor(stats.hp * 100) / 100,
			stars: Math.floor(stars.total * 100) / 100,
			mods: mods.toString(options.mods),
			combo: options.combo,
			maxCombo: parser.map.max_combo(),
			accuracy: options.accuracy,
			totalHits: parser.map.objects.length,
			pp: Math.floor(output.total * 100) / 100,
			ppFC: FC.total,
		};


		callback(jsonOutput);
	});
}

function calculateCatchpp(data) {
	var value = Math.pow(5 * Math.max(1, (data.diff_aim) / 0.0049) - 4, 2) / 100000;
	var totalHits = parseInt(data.count300) + parseInt(data.count100) + parseInt(data.countmiss);

	var lengthBonus = 0.95 + 0.4 * Math.min(1, totalHits / 3000) + (totalHits > 3000 ? Math.log10(totalHits / 3000) * 0.5 : 0);
	value *= lengthBonus;
	value *= Math.pow(0.97, data.countmiss);

	if (data.max_combo > 0) {
		value *= Math.min(Math.pow(data.maxcombo, 0.8) / Math.pow(data.max_combo, 0.8), 1);
	}

	var approachRateFactor = 1;
	if (data.diff_approach > 9) {
		approachRateFactor += 0.1 * (data.diff_approach - 9);
	} else if (data.diff_approach < 8) {
		approachRateFactor += 0.025 * (8 - data.diff_approach);
	}

	value *= approachRateFactor;
	var enabled_mods = mods.toString(data.enabled_mods);
	if (enabled_mods.includes('HD')) {
		value *= 1.05 + 0.075 * (10 - Math.min(10, data.diff_approach));
	}

	if (enabled_mods.includes('FL')) {
		value *= 1.35 * lengthBonus;
	}

	value *= Math.pow(data.accuracy / 100, 5.5);

	if (enabled_mods.includes('NF')) {
		value *= 0.9;
	}

	if (enabled_mods.includes('SO')) {
		value *= 0.95;
	}

	return {
		title: data.title,
		artist: data.artist,
		difficultyName: data.version,
		creator: data.creator,
		AR: data.diff_approach,
		OD: data.diff_overall,
		CS: data.diff_size,
		HP: data.diff_drain,
		stars: data.difficultyrating,
		mods: enabled_mods,
		combo: data.maxcombo + '/' + data.max_combo + 'x',
		accuracy: data.accuracy,
		pp: Math.floor(value * 100) / 100
	};
}

function calculateManiapp(data) {
	data.difficultyrating = parseFloat(data.difficultyrating);
	data.diff_overall = parseFloat(data.diff_overall);
	data.maxcombo = parseInt(data.maxcombo);
	data.score = parseInt(data.score);
	data.accuracy = parseFloat(data.accuracy);
	data.totalHits = parseInt(data.count50) + parseInt(data.count100) + parseInt(data.count300) + parseInt(data.countmiss) + parseInt(data.countgeki) + parseInt(data.countkatu);
	var enabled_mods = mods.toString(data.enabled_mods).replace('No Mod', '');
	
	// Strain
	var scoreMultiplier = mods.getScoreMultiplier(enabled_mods,3);
	var strainValue = 0;
	if (scoreMultiplier <= 0)
	{
		return;
	}
	
	data.score *= 1/scoreMultiplier;

	strainValue = Math.pow(5 * Math.max(1, data.difficultyrating / 0.2) - 4, 2.2) / 135;

	strainValue *= 1 + 0.1 * Math.min(1, data.totalHits/1500);

	if (data.score <= 500000) {
		strainValue = 0;
	} else if (data.score <= 600000) {
		strainValue *= (data.score - 500000) / 100000 * 0.3;
	} else if (data.score <= 700000) {
		strainValue *= 0.3 + (data.score - 600000) / 100000 * 0.25;
	} else if (data.score <= 800000) {
		strainValue *= 0.55 + (data.score - 700000) / 100000 * 0.20;
	} else if (data.score <= 900000) {
		strainValue *= 0.75 + (data.score - 800000) / 100000 * 0.15;
	} else {
		strainValue *= 0.90 + (data.score - 900000) / 100000 * 0.1;
	}

	// Accuracy
	var hitWindow300 = 34 + 3 * Math.min(10, Math.max(0, 10.0 - data.diff_overall));
	var accValue = 0;
	if (hitWindow300 <= 0) {
		accValue = 0;
		return;
	}

	accValue = Math.max(0, 0.2 - ((hitWindow300 - 34) * 0.00667)) * strainValue * Math.pow((Math.max(0, (data.score - 960000)/40000)),1.1);

	// Total
	var modMultiplier = 0.8;

	if (enabled_mods.includes('NF')) {
		modMultiplier *= 0.90;
	}

	if (enabled_mods.includes('SO')) {
		modMultiplier *= 0.95;
	}

	if (enabled_mods.includes('EZ')) {
		modMultiplier *= 0.50;
	}

	var value = Math.pow(Math.pow(strainValue, 1.1) + Math.pow(accValue, 1.1),1 / 1.1) * modMultiplier;

	return {
		title: data.title,
		artist: data.artist,
		difficultyName: data.version,
		creator: data.creator,
		OD: data.diff_overall,
		stars: data.difficultyrating,
		mods: enabled_mods,
		totalHits: data.totalHits,
		accuracy: data.accuracy,
		pp: Math.floor(value * 100) / 100
	};		
}


module.exports = {
	calculatepp: calculatepp,
	calculateCatchpp: calculateCatchpp,
	calculateManiapp: calculateManiapp
};