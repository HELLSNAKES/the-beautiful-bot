/* eslint-disable no-undef */

import * as parser from '../handlers/parser';

test('should test for valid user urls', () => {
	// Normal links
	expect(parser.userURL('https://osu.ppy.sh/users/14392546')).toEqual({userId: '14392546', success: true});
	expect(parser.userURL('https://osu.ppy.sh/users/8382196')).toEqual({userId: '8382196', success: true});
	// gamemode specified links
	expect(parser.userURL('https://osu.ppy.sh/users/3789276/osu')).toEqual({userId: '3789276', success: true});
	expect(parser.userURL('https://osu.ppy.sh/users/11476991/osu')).toEqual({userId: '11476991', success: true});
	expect(parser.userURL('https://osu.ppy.sh/users/9981017/taiko')).toEqual({userId: '9981017', success: true});
	expect(parser.userURL('https://osu.ppy.sh/users/4964596/taiko')).toEqual({userId: '4964596', success: true});
	expect(parser.userURL('https://osu.ppy.sh/users/3636998/fruits')).toEqual({userId: '3636998', success: true});
	expect(parser.userURL('https://osu.ppy.sh/users/3770603/fruits')).toEqual({userId: '3770603', success: true});
	expect(parser.userURL('https://osu.ppy.sh/users/6764101/mania')).toEqual({userId: '6764101', success: true});
	expect(parser.userURL('https://osu.ppy.sh/users/4952941/mania')).toEqual({userId: '4952941', success: true});
	expect(parser.userURL('https://osu.ppy.sh/users/4952941/mania')).toEqual({userId: '4952941', success: true});
	// Special case 
	expect(parser.userURL('https://osu.ppy.sh/users/2')).toEqual({userId: '2', success: true}); // Check for peppy of course
	// Shortend URLS
	expect(parser.userURL('https://osu.ppy.sh/u/14392546')).toEqual({userId: '14392546', success: true});
	expect(parser.userURL('https://osu.ppy.sh/u/8454773/osu')).toEqual({userId: '8454773', success: true});
	expect(parser.userURL('https://osu.ppy.sh/u/5918857/taiko')).toEqual({userId: '5918857', success: true});
	expect(parser.userURL('https://osu.ppy.sh/u/5351518/fruits')).toEqual({userId: '5351518', success: true});
	expect(parser.userURL('https://osu.ppy.sh/u/15028818/mania')).toEqual({userId: '15028818', success: true});
	// Cases with usernames instead of numbers
	expect(parser.userURL('https://osu.ppy.sh/u/Moorad')).toEqual({userId: 'Moorad', success: true});
	expect(parser.userURL('https://osu.ppy.sh/u/-%20Heatwave%20-')).toEqual({userId: '-%20Heatwave%20-', success: true});
	expect(parser.userURL('https://osu.ppy.sh/u/Lothus/osu')).toEqual({userId: 'Lothus', success: true});
	expect(parser.userURL('https://osu.ppy.sh/u/Dawt/taiko')).toEqual({userId: 'Dawt', success: true});
	expect(parser.userURL('https://osu.ppy.sh/u/Crystallize/fruits')).toEqual({userId: 'Crystallize', success: true});
	expect(parser.userURL('https://osu.ppy.sh/u/Cabbage21/mania')).toEqual({userId: 'Cabbage21', success: true});
	// Other cases
	expect(parser.userURL('http://osu.ppy.sh/users/14392546')).toEqual({userId: '14392546', success: true});
	expect(parser.userURL('blah blah https://osu.ppy.sh/users/14392546 blah blah blah')).toEqual({userId: '14392546', success: true});
	expect(parser.userURL('osu.ppy.sh/users/14392546')).toEqual({userId: '14392546', success: true});
	expect(parser.userURL('blah blah osu.ppy.sh/u/14392546')).toEqual({userId: '14392546', success: true});
});


test('should test for invalid user urls', () => {
	expect(parser.userURL('https://os.ppy.sh/users/14392546')).toEqual({userId: null, success: false});
	expect(parser.userURL('https://osu.pyy.sh/users/8382196')).toEqual({userId: null, success: false});
	expect(parser.userURL('Blah blah blah no link here blah blah blah')).toEqual({userId: null, success: false});
	expect(parser.userURL('https://google.com/')).toEqual({userId: null, success: false});
	expect(parser.userURL('https://osu.ppy.sh/beatmapsets/39804#osu/126645')).toEqual({userId: null, success: false});
	expect(parser.userURL('https://osu.ppy.sh/users')).toEqual({userId: null, success: false});
});

test('should test for valid beatmap urls', () => {
	// Normal links (osu)
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/486142#osu/1036654')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/486142#osu/1036654',
		beatmapID: '1036654',
		beatmapsetID: '486142',
		ruleset: 0,
		valid: true
	});
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/488238#osu/1044378')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/488238#osu/1044378',
		beatmapID: '1044378',
		beatmapsetID: '488238',
		ruleset: 0,
		valid: true
	});
	// Normal links (taiko)
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/847323#taiko/1774604')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/847323#taiko/1774604',
		beatmapID: '1774604',
		beatmapsetID: '847323',
		ruleset: 1,
		valid: true
	});
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/931741#taiko/2025911')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/931741#taiko/2025911',
		beatmapID: '2025911',
		beatmapsetID: '931741',
		ruleset: 1,
		valid: true
	});
	// Normal links (catch)
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/767346#fruits/1612940')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/767346#fruits/1612940',
		beatmapID: '1612940',
		beatmapsetID: '767346',
		ruleset: 2,
		valid: true
	});
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/972887#fruits/2036865')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/972887#fruits/2036865',
		beatmapID: '2036865',
		beatmapsetID: '972887',
		ruleset: 2,
		valid: true
	});
	// Normal links (mania)
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/971561#mania/2034200')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/971561#mania/2034200',
		beatmapID: '2034200',
		beatmapsetID: '971561',
		ruleset: 3,
		valid: true
	});
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/400078#mania/992512')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/400078#mania/992512',
		beatmapID: '992512',
		beatmapsetID: '400078',
		ruleset: 3,
		valid: true
	});
	// Shortend URLS
	// expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/486142')).toEqual({
	// 	URL: 'osu.ppy.sh/beatmapsets/486142',
	// 	beatmapID: undefined,
	// 	beatmapsetID: '486142',
	// 	ruleset: 0,
	// 	valid: true
	// });
	// expect(parser.beatmapURL('https://osu.ppy.sh/s/488238')).toEqual({
	// 	URL: 'osu.ppy.sh/s/488238',
	// 	beatmapID: undefined,
	// 	beatmapsetID: '488238',
	// 	ruleset: 0,
	// 	valid: true
	// });
	expect(parser.beatmapURL('https://osu.ppy.sh/b/2034200')).toEqual({
		URL: 'osu.ppy.sh/b/2034200',
		beatmapID: '2034200',
		beatmapsetID: undefined,
		ruleset: 0,
		valid: true
	});
	// Other cases
	expect(parser.beatmapURL('http://osu.ppy.sh/b/1036654')).toEqual({
		URL: 'osu.ppy.sh/b/1036654',
		beatmapID: '1036654',
		beatmapsetID: undefined,
		ruleset: 0,
		valid: true
	});
	// expect(parser.beatmapURL('blah blah https://osu.ppy.sh/s/488238 blah blah blah')).toEqual({
	// 	URL: 'osu.ppy.sh/s/488238',
	// 	beatmapID: undefined,
	// 	beatmapsetID: '488238',
	// 	ruleset: 0,
	// 	valid: true
	// });
	expect(parser.beatmapURL('osu.ppy.sh/beatmapsets/486142#osu/1036654')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/486142#osu/1036654',
		beatmapID: '1036654',
		beatmapsetID: '486142',
		ruleset: 0,
		valid: true
	});
	expect(parser.beatmapURL('blah blah osu.ppy.sh/beatmapsets/486142#osu/1036654')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/486142#osu/1036654',
		beatmapID: '1036654',
		beatmapsetID: '486142',
		ruleset: 0,
		valid: true
	});
	expect(parser.beatmapURL('osu.ppy.sh/beatmapsets/486142#sdsdsdsdsd/1036654')).toEqual({
		URL: 'osu.ppy.sh/beatmapsets/486142#sdsdsdsdsd/1036654',
		beatmapID: '1036654',
		beatmapsetID: '486142',
		ruleset: 0,
		valid: true
	});
});


test('should test for invalid beatmap urls', () => {
	const expectedOutput = {
		URL: undefined,
		beatmapID: undefined,
		beatmapsetID: undefined,
		ruleset: 0,
		valid: false
	};

	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/4s86142#osu/1036654')).toEqual(expectedOutput);
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets/4s86142#osu/10366d54')).toEqual(expectedOutput);
	expect(parser.beatmapURL('Blah blah blah no link here blah blah blah')).toEqual(expectedOutput);
	expect(parser.beatmapURL('https://google.com/')).toEqual(expectedOutput);
	expect(parser.beatmapURL('https://osu.ppy.sh/users/14392546')).toEqual(expectedOutput);
	expect(parser.beatmapURL('https://osu.ppy.sh/beatmapsets')).toEqual(expectedOutput);
});