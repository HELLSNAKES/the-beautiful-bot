/* eslint-disable no-useless-escape */
'use strict';

import { IOjsamaOptions } from './interfaces';

import * as mods from './mods';
import * as error from '../handlers/error';

const ojsama = require('ojsama');
const request = require('request');
const tbbpp = require('tbbpp');

export function calculatepp(beatmapId: string, options: IOjsamaOptions, callback: (json: any) => void = (): void => { }): any {

	var parser = new ojsama.parser();

	request({
		url: `https://osu.ppy.sh/osu/${beatmapId}`,
		encoding: null
	}, (err: any, res: any, body: any) => {
		if (options.ppv3) {
			var osuContent = tbbpp.processContent(body);
			
			options.combo = (options.combo ? options.combo : osuContent.maxCombo);

			var ppv3Options : any = options;
			ppv3Options.maxCombo = options.combo;
			ppv3Options.countMiss = options.misses;
			ppv3Options.accuracy = ppv3Options.accuracy / 100; 

			var pp = tbbpp.calculatePerformancePoints(osuContent, ppv3Options);

			ppv3Options.maxCombo = osuContent.maxCombo;
			var ppFC = tbbpp.calculatePerformancePoints(osuContent, ppv3Options);

			Promise.all([pp, ppFC]).then((values : Array<any>) => {
				callback({
					error: null,
					beatmapId: beatmapId,
					title: osuContent.Title,
					artist: osuContent.Artist,
					difficultyName: osuContent.Version,
					creator: osuContent.Creator,
					AR: osuContent.ApproachRate,
					OD: osuContent.OverallDifficulty,
					CS: osuContent.CircleSize,
					HP: osuContent.HPDrainRate,
					stars: Math.round(values[0].attributes.StarRating * 100) /100,
					mods: mods.toString(typeof options.mods == 'string' ? 0 : options.mods!),
					combo: options.combo,
					maxCombo: osuContent.maxCombo,
					accuracy: (options.accuracy ?? 1) * 100,
					totalHits: osuContent.hitObjects.length,
					pp: Math.floor(values[0].pp * 100) / 100,
					ppFC: values[1].pp,
				});
			}).catch((err) => {error.unexpectedError(err, `pp calculation : ${beatmapId} : ${JSON.stringify(options)}`);});

		} else {
			parser.feed(body.toString());
	
			var params: any = {
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
				stars: Math.round(stars.total * 100) / 100,
				mods: mods.toString(typeof options.mods == 'string' ? 0 : options.mods),
				combo: options.combo,
				maxCombo: parser.map.max_combo(),
				accuracy: options.accuracy,
				totalHits: parser.map.objects.length,
				pp: Math.floor(output.total * 100) / 100,
				ppFC: FC.total,
			};
	
	
			callback(jsonOutput);
		}
	});
}

export function calculateCatchpp(data: any): any {
	var difficultyrating = parseFloat(data.difficultyrating);
	var diff_approach = parseFloat(data.diff_approach);
	var max_combo = parseInt(data.max_combo);
	var maxcombo = parseInt(data.maxcombo);
	var count300 = parseInt(data.count300);
	var count100 = parseInt(data.count100);
	var countmiss = parseInt(data.countmiss);

	
	var value = Math.pow(5 * Math.max(1, (difficultyrating) / 0.0049) - 4, 2) / 100000;
	var totalHits = count300 + count100 + countmiss;

	var lengthBonus = 0.95 + 0.3 * Math.min(1, totalHits / 2500) + (totalHits > 2500 ? Math.log10(totalHits / 2500) * 0.475 : 0);
	value *= lengthBonus;
	value *= Math.pow(0.97, countmiss);

	if (max_combo > 0) {
		value *= Math.min(Math.pow(maxcombo, 0.8) / Math.pow(max_combo, 0.8), 1);
	}

	var approachRateFactor = 1;
	if (diff_approach > 9) {
		approachRateFactor += 0.1 * (diff_approach - 9);
	} 
	if (diff_approach > 10) {
		approachRateFactor += 0.1 * (diff_approach - 10);
	} else if (diff_approach < 8) {
		approachRateFactor += 0.025 * (8 - diff_approach);
	}

	value *= approachRateFactor;

	if (mods.has(data.enabled_mods, 'HD')) {
		value *= 1.05 + 0.075 * (10 - Math.min(10, diff_approach));

		if (diff_approach <= 10) {
			value *= 1.05 + 0.075 * (10 - diff_approach);
		} else if (diff_approach > 10) {
			value *= 1.01+ 0.04 * (11 - Math.min(11, diff_approach));
		}
	}

	if (mods.has(data.enabled_mods, 'FL')) {
		value *= 1.35 * lengthBonus;
	}

	value *= Math.pow(data.accuracy / 100, 5.5);

	if (mods.has(data.enabled_mods, 'NF')) {
		value *= 0.9;
	}

	if (mods.has(data.enabled_mods, 'SO')) {
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
		mods: mods.toString(data.enabled_mods),
		combo: data.maxcombo + '/' + data.max_combo + 'x',
		accuracy: data.accuracy,
		pp: Math.floor(value * 100) / 100
	};
}

export function calculateManiapp(data: any): any {
	data.difficultyrating = parseFloat(data.difficultyrating);
	data.diff_overall = parseFloat(data.diff_overall);
	data.maxcombo = parseInt(data.maxcombo);
	data.score = parseInt(data.score);
	data.accuracy = parseFloat(data.accuracy);
	data.totalHits = parseInt(data.count50) + parseInt(data.count100) + parseInt(data.count300) + parseInt(data.countmiss) + parseInt(data.countgeki) + parseInt(data.countkatu);

	// Strain
	var scoreMultiplier = mods.getScoreMultiplier(data.enabled_mods, 3);
	var strainValue = 0;
	if (scoreMultiplier <= 0) {
		return;
	}

	data.score *= 1 / scoreMultiplier;

	strainValue = Math.pow(5 * Math.max(1, data.difficultyrating / 0.2) - 4, 2.2) / 135;

	strainValue *= 1 + 0.1 * Math.min(1, data.totalHits / 1500);

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

	accValue = Math.max(0, 0.2 - ((hitWindow300 - 34) * 0.00667)) * strainValue * Math.pow((Math.max(0, (data.score - 960000) / 40000)), 1.1);

	// Total
	var modMultiplier = 0.8;

	if (mods.has(data.enabled_mods, 'NF')) {
		modMultiplier *= 0.90;
	}

	if (mods.has(data.enabled_mods, 'SO')) {
		modMultiplier *= 0.95;
	}

	if (mods.has(data.enabled_mods, 'EZ')) {
		modMultiplier *= 0.50;
	}

	var value = Math.pow(Math.pow(strainValue, 1.1) + Math.pow(accValue, 1.1), 1 / 1.1) * modMultiplier;

	return {
		title: data.title,
		artist: data.artist,
		difficultyName: data.version,
		creator: data.creator,
		OD: data.diff_overall,
		stars: data.difficultyrating,
		mods: mods.toString(data.enabled_mods),
		totalHits: data.totalHits,
		accuracy: data.accuracy,
		pp: Math.floor(value * 100) / 100
	};
}

export function calculateTaikopp(data : any) : any {
	data.difficultyrating = parseFloat(data.difficultyrating);
	data.diff_overall = parseFloat(data.diff_overall);
	data.maxcombo = parseInt(data.maxcombo);
	// data.score = parseInt(data.score);
	data.accuracy = parseFloat(data.accuracy) / 100;
	// data.totalHits = parseInt(data.count50) + parseInt(data.count100) + parseInt(data.count300) + parseInt(data.countmiss) + parseInt(data.countgeki) + parseInt(data.countkatu);
	var enabled_mods = mods.toString(data.enabled_mods).replace('No Mod', '');
	var countGreat = parseInt(data.count300);
	var countGood = parseInt(data.count100);
	var countMeh = parseInt(data.count50);
	var countMiss = parseInt(data.countmiss);
	var totalHits = countGreat + countGood + countMeh + countMiss;

	var multiplier = 1.1;

	if (enabled_mods.includes('NF')) multiplier *= 0.9;

	if (enabled_mods.includes('HD')) multiplier *= 1.1;

	var strainValue =  Math.pow(5 * Math.max(1, data.difficultyrating / 0.0075) - 4, 2) / 100000;
	var lengthBonus = 1 + 0.1 * Math.min(1, totalHits / 1500);
	strainValue *= lengthBonus;
	strainValue *= Math.pow(0.985, countMiss);

	if (totalHits > 0) strainValue *= Math.min(Math.pow(data.maxcombo, 0.5) / Math.pow(totalHits, 0.5), 1);
	
	if (enabled_mods.includes('HD')) strainValue *= 1.025;

	if (enabled_mods.includes('FL')) strainValue *= 1.05 * lengthBonus;

	strainValue = strainValue * data.accuracy;

	var accuracyValue = 0;

	// Hitwindows
	var clockRate = 1;
	if (enabled_mods.includes('DT') || enabled_mods.includes('NC')) clockRate = 1.5;
	if (enabled_mods.includes('HT')) clockRate = 0.75;
	var hitWindow300Range = [50, 35, 20];
	
	if (data.diff_overall > 5) {
		var hitWindow300 = hitWindow300Range[1] + (hitWindow300Range[2] - hitWindow300Range[1]) * (data.diff_overall - 5) / 5;
	} else if (data.diff_overall < 5) {
		hitWindow300 = hitWindow300Range[1] - (hitWindow300Range[1] - hitWindow300Range[0]) * (5 - data.diff_overall) / 5;
	} else {
		hitWindow300 = hitWindow300Range[1];
	}

	hitWindow300 /= clockRate;
	
	if (hitWindow300 <= 0) {
		accuracyValue = 0;
		return;
	}

	accuracyValue = Math.pow(150 / hitWindow300, 1.1) * Math.pow(data.accuracy, 15) * 22;
	
	accuracyValue = accuracyValue * Math.min(1.15, Math.pow(totalHits / 1500, 0.3));

	var totalValue = Math.pow(Math.pow(strainValue, 1.1) + Math.pow(accuracyValue, 1.1), 1.0 / 1.1) * multiplier;

	return {
		title: data.title,
		artist: data.artist,
		difficultyName: data.version,
		creator: data.creator,
		OD: data.diff_overall,
		stars: data.difficultyrating,
		mods: enabled_mods,
		totalHits: totalHits,
		accuracy: Math.floor(data.accuracy * 10000) / 100,
		pp: Math.floor(totalValue * 100) / 100
	};
}