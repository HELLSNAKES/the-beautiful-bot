'use strict';

import { IURLParserBeatmap } from './interfaces';

export const modes : any = {
	'0' : 'Standard',
	'1': 'Taiko',
	'2': 'Catch',
	'3': 'Mania'
};

export function userURL(url: string): any {
	var returnObject: any = {
		userId: null,
		success: true
	};
	var pattern = /^(http(s)?:\/\/)?osu.ppy.sh\/(users|u)\/\d+/g;
	var patternWithoutDigits = /^(http(s)?:\/\/)?osu.ppy.sh\/(users|u)\//g;
	if (pattern.test(url)) {
		returnObject.userId = url.match(pattern)![0].replace(patternWithoutDigits, '');
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
	// var patterns = [/beatmapsets\/\d+#[a-zA-Z]+\/\d+/g, /(beatmapsets|s)\/\d+/g, /b\/\d+/g]; // Disabled because beatmapset ID is required which means the function has to become asynchronous
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