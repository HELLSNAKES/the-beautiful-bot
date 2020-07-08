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
	expect(parser.userURL('https://osu.pyy.sh/users/2')).toEqual({userId: '2', success: true}); // Check for peppy of course
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
