/* eslint-disable no-useless-escape */
import { IOjsamaOptions } from './interfaces';

import * as mods from './mods';
import * as error from '../handlers/error';
import * as score from '../handlers/score';
import * as beatmap from '../handlers/beatmap';
import * as parserHandler from '../handlers/parser';

const ojsama = require('ojsama');
const axios = require('axios');
const tbbpp = require('tbbpp');

export function calculatepp(beatmapId: string, options: IOjsamaOptions, callback: (json: any) => void = (): void => { }): any {

	var parser = new ojsama.parser();

	var clockRate = 1;
	if (mods.has(options.mods!, 'DT')) clockRate = 1.5;
	if (mods.has(options.mods!, 'HT')) clockRate = 0.75;

	axios.get(`https://osu.ppy.sh/osu/${beatmapId}`)
		.then((res: any) => {

			var osuContent : any = parserHandler.parseOsu(res.data);
			
			if (options.ppv3) {
				osuContent = tbbpp.processContent(res.data);
    
				options.combo = (options.combo ? options.combo : osuContent.maxCombo);

				var ppv3Options : any = options;
				ppv3Options.combo = options.combo;
				ppv3Options.misses = options.misses;
				ppv3Options.accuracy = ppv3Options.accuracy / 100; 
				ppv3Options.mods = mods.toString(Number(options.mods));

				var pp = tbbpp.calculatePerformancePoints(osuContent, ppv3Options);

				ppv3Options.combo = osuContent.maxCombo;
				var ppFC = tbbpp.calculatePerformancePoints(osuContent, ppv3Options);
				Promise.all([pp, ppFC]).then((values : Array<any>) => {
					try {
						var bpm = beatmap.getVariableBPM('-', osuContent.bpmMin, osuContent.bpmMax, osuContent.timingPoints, osuContent.totalTime, clockRate);
					} catch {
						bpm = '-';
					}
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
						stars: Math.round(values[0].attributes.SR * 100) /100,
						mods: mods.toString(typeof options.mods == 'string' ? 0 : options.mods!),
						combo: options.combo,
						maxCombo: osuContent.maxCombo,
						accuracy: (options.accuracy ?? 1) * 100,
						totalHits: osuContent.hitObjects.length,
						pp: Math.floor(values[0].pp * 100) / 100,
						ppFC: values[1].pp,
						BPM: bpm
					});
				}).catch((err) => {error.unexpectedError(err, `pp calculation : ${beatmapId} : ${JSON.stringify(options)}`);});

			} else {
				parser.feed(res.data.toString());
		
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
				
				try {
					var bpm = beatmap.getVariableBPM('-', osuContent.bpmMin, osuContent.bpmMax, osuContent.timingPoints, Math.floor(parser.map.objects[parser.map.objects.length - 1].time / 1000), clockRate);
				} catch {
					bpm = '-';
				}

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
					pp: isNaN(output.total) ? '-' : Math.floor(output.total * 100) / 100,
					ppFC: FC.total,
					BPM: bpm
				};
		
		
				callback(jsonOutput);
			}
		}).catch((err : Error) => {error.unexpectedError(err, `While trying to request .osu file for pp calculation : ${beatmapId} : ${JSON.stringify(options)}`);});
}

export function calculateCatchpp(data: any): any {
	var difficultyrating = parseFloat(data.difficultyrating);
	var diff_approach = parseFloat(data.diff_approach);
	var max_combo = parseInt(data.max_combo);
	var maxcombo = parseInt(data.maxcombo);
	const fruitsHit = parseInt(data.count300);
	const ticksHit = parseInt(data.count100);
	const misses = parseInt(data.countmiss);

	
	var value = Math.pow(5 * Math.max(1, (difficultyrating) / 0.0049) - 4, 2) / 100000;
	var numTotalHits = misses + ticksHit + fruitsHit;

	var lengthBonus = 0.95 + 0.3 * Math.min(1, numTotalHits / 2500) + (numTotalHits > 2500 ? Math.log10(numTotalHits / 2500) * 0.475 : 0);
	value *= lengthBonus;
	value *= Math.pow(0.97, misses);

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
			value *= 1.01 + 0.04 * (11 - Math.min(11, diff_approach));
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
		pp: value
	};
}

export function calculateManiapp(data: any): any {
	const SR = parseFloat(data.difficultyrating);
	const OD = parseFloat(data.diff_overall);
	const accuracy = parseFloat(data.accuracy);
	const totalHits = data.totalHits;
	
	var score = parseInt(data.score);
	
	// Strain
	var scoreMultiplier = mods.getScoreMultiplier(data.enabled_mods, 3);
	var strainValue = 0;
	if (scoreMultiplier <= 0) {
		return;
	}

	score *= 1 / scoreMultiplier;

	strainValue = Math.pow(5 * Math.max(1, SR / 0.2) - 4, 2.2) / 135;

	strainValue *= 1 + 0.1 * Math.min(1, totalHits / 1500);

	if (score <= 500000) {
		strainValue = 0;
	} else if (score <= 600000) {
		strainValue *= (score - 500000) / 100000 * 0.3;
	} else if (score <= 700000) {
		strainValue *= 0.3 + (score - 600000) / 100000 * 0.25;
	} else if (score <= 800000) {
		strainValue *= 0.55 + (score - 700000) / 100000 * 0.20;
	} else if (score <= 900000) {
		strainValue *= 0.75 + (score - 800000) / 100000 * 0.15;
	} else {
		strainValue *= 0.90 + (score - 900000) / 100000 * 0.1;
	}

	// Accuracy
	var hitWindow300 = 34 + 3 * Math.min(10, Math.max(0, 10.0 - OD));
	var accValue = 0;
	if (hitWindow300 <= 0) {
		accValue = 0;
		return;
	}

	accValue = Math.max(0, 0.2 - ((hitWindow300 - 34) * 0.00667)) * strainValue * Math.pow((Math.max(0, (score - 960000) / 40000)), 1.1);

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
		accuracy: accuracy,
		pp: Math.floor(value * 100) / 100
	};
}

export function calculateTaikopp(data : any) : any {
	data.difficultyrating = parseFloat(data.difficultyrating);
	data.diff_overall = parseFloat(data.diff_overall);
	data.maxcombo = parseInt(data.maxcombo);
	const countGreat = parseInt(data.count300);
	const countGood = parseInt(data.count100);
	const countMeh = parseInt(data.count50);
	const countMiss = parseInt(data.countmiss);
	const countKatu = parseInt(data.countkatu);
	const countGeki = parseInt(data.countgeki);
	data.accuracy = score.getAccuracy(1, countGreat, countGood, countMeh, countMiss,countKatu, countGeki, false) / 100;
	var totalHits = countGreat + countGood + countMeh + countMiss;
	var multiplier = 1.1;
	
	if (mods.has(data.enabled_mods, 'NF')) multiplier *= 0.9;
	
	if (mods.has(data.enabled_mods, 'HD')) multiplier *= 1.1;
	
	var strainValue =  Math.pow(5 * Math.max(1, data.difficultyrating / 0.0075) - 4, 2) / 100000;
	var lengthBonus = 1 + 0.1 * Math.min(1, totalHits / 1500);
	strainValue *= lengthBonus;
	strainValue *= Math.pow(0.985, countMiss);
	
	if (totalHits > 0) strainValue *= Math.min(Math.pow(data.maxcombo, 0.5) / Math.pow(totalHits, 0.5), 1);
	
	if (mods.has(data.enabled_mods, 'HD')) strainValue *= 1.025;
	
	if (mods.has(data.enabled_mods, 'FL')) strainValue *= 1.05 * lengthBonus;
	
	strainValue = strainValue * data.accuracy;
	
	var accuracyValue = 0;
	
	// Scale OD
	if (mods.has(data.enabled_mods, 'EZ')) {
		data.diff_overall /= 2;
	}
	
	if (mods.has(data.enabled_mods, 'HR')) {
		data.diff_overall *= 1.4;
	}

	data.diff_overall = Math.max(Math.min(data.diff_overall, 10), 0);

	// Hitwindows
	const max = 20;
	const min = 50;
	var hitWindow300 = min + (max - min) * data.diff_overall / 10;
	
	hitWindow300 = Math.floor(hitWindow300);

	if (mods.has(data.enabled_mods, 'HT')){
		hitWindow300 /= 0.75;
	}
	if (mods.has(data.enabled_mods, 'DT')) {
		hitWindow300 /= 1.5;
	}
	
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
		mods: mods.toString(data.enabled_mods),
		totalHits: totalHits,
		accuracy: Math.round(data.accuracy * 10000) / 100,
		pp: totalValue
	};
}