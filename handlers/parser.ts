/* eslint-disable no-useless-escape */
import { IURLParserBeatmap } from './interfaces';
import * as error from './error';

export const modes : any = {
	'0' : 'Standard',
	'1': 'Taiko',
	'2': 'Catch',
	'3': 'Mania'
};

export function userURL(content: string): any {
	var returnObject: any = {
		userId: null,
		success: true
	};
	var pattern = /(http(s)?:\/\/)?osu.ppy.sh\/(users|u)\/[0-9A-Za-z_!\?\-\[\]%]+/;
	var patternWithoutDigits = /(http(s)?:\/\/)?osu.ppy.sh\/(users|u)\//;
	if (pattern.test(content)) {
		var extractedURL = pattern.exec(content)![0];
		returnObject.userId = extractedURL.match(pattern)![0].replace(patternWithoutDigits, '');
		if (returnObject.userId.includes('/')) returnObject.userId =  returnObject.userId.slice(0,returnObject.userId.indexOf('/')); 
	} else {
		returnObject.success = false;
	}
	return returnObject;
}

export function beatmapURL(url : string) : any {
	var results : IURLParserBeatmap = {
		URL: undefined,
		beatmapID: undefined,
		beatmapsetID: undefined,
		ruleset: 0,
		valid: false
	};
	var patternStart = /(http(s)?:\/\/)?osu.ppy.sh\//;
	// var patterns = [/beatmapsets\/\d+#[a-zA-Z]+\/\d+/g, /(beatmapsets|s)\/\d+/g, /b\/\d+/g]; // Disabled because beatmap ID is required which means the function has to become asynchronous
	var patterns = [/beatmapsets\/\d+#[a-zA-Z]+\/\d+/g,/b\/\d+/g];

	// URL cleaning
	url = url.replace(/http(s)?:\/\//, '');

	for (var i = 0; i < patterns.length; i++) {
		var currentPattern = new RegExp(patternStart.source + patterns[i].source);
		
		if (currentPattern.test(url)) {
			var extractedURL = currentPattern.exec(url)![0];
			if (i == 0) {
				if (extractedURL.includes('#osu')) results.ruleset = 0;
				else if (extractedURL.includes('#taiko')) results.ruleset = 1;
				else if (extractedURL.includes('#fruits')) results.ruleset = 2;
				else if (extractedURL.includes('#mania')) results.ruleset = 3;
				else results.ruleset = 0;

				results.beatmapsetID = extractedURL.slice(extractedURL.indexOf('/') + 12 + 1, extractedURL.indexOf('#'));
				results.beatmapID = extractedURL.slice(extractedURL.lastIndexOf('/') + 1);
			} else if (i == 1) {
				results.beatmapID = extractedURL.slice(extractedURL.indexOf('/') + 2 + 1);
				// results.beatmapsetID = undefined, results.ruleset = 0 by default
			}

			results.URL = extractedURL;
			results.valid = true;
			return results;
		}
	}

	// results.beatmapID = results.beatmapsetID = results.URL = undefined, results.ruleset = 0 by default
	return results;
}

/* 
else if (i == 1) {
	results.beatmapsetID = extractedURL.slice(extractedURL.indexOf('/') + (extractedURL.includes('beatmapsets') ? 12 : 2) + 1);
	// results.beatmapID = undefined, results.ruleset = 0 by default
} 
*/

export function parseOsu(content : String) {
	const fileSplit = content.split('\r\n');
		const timingPointsIndex = fileSplit.findIndex((x : String) => x == '[TimingPoints]');
		const endTimingPointsIndex = fileSplit.slice(timingPointsIndex).findIndex((x : String) => x == '');

		if (timingPointsIndex == -1 || endTimingPointsIndex == -1) {
			error.unexpectedError(new Error('Invalid start or end timing point index'), 'Tried parsing .osu');
			return;
		}

		var timingPointObjects = [];

		for (var i = timingPointsIndex + 1; i < timingPointsIndex + endTimingPointsIndex; i++) {
			var line = fileSplit[i].split(','); 
			timingPointObjects.push({
				offset: Number(line[0]),
				timingChange: !!Number(line[6]),
				bpm: Math.round(60000 / Number(line[1]))
			});
		}

		var bpmMin = Infinity;
		var bpmMax = 0;
		for (i = 0; i < timingPointObjects.length; i++) {
			if (timingPointObjects[i].timingChange && timingPointObjects[i].bpm > bpmMax) {
				bpmMax = timingPointObjects[i].bpm;
			}

			if (timingPointObjects[i].timingChange && timingPointObjects[i].bpm < bpmMin) {
				bpmMin = timingPointObjects[i].bpm;
			}
		}

		return ({
			timingPoints: timingPointObjects,
			bpmMin: bpmMin,
			bpmMax: bpmMax
		});
}