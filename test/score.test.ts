/* eslint-disable no-undef */

import * as score from '../handlers/score';

test('should test for accuracy calculation (osu ruleset)', () => {
	expect(score.getAccuracy(0,1227,0,0,0,1024,203)).toBe(100); // SS
	expect(score.getAccuracy(0,781,22,0,0)).toBe(98.17); // S
	expect(score.getAccuracy(0,783,15,0,5)).toBe(98.13); // A
	expect(score.getAccuracy(0,1134,190,15,58)).toBe(85.89); // B
	expect(score.getAccuracy(0,1769,460,125,88)).toBe(79.57); // C
	expect(score.getAccuracy(0,2,4,4,8)).toBe(22.22); // D (Extremely Extremely low acc)
});

test('should test for accuracy calculation (taiko ruleset)', () => {
	expect(score.getAccuracy(1,74,0,0,0,0,26)).toBe(100); // SS
	expect(score.getAccuracy(1,992,29,0,0)).toBe(98.58); // S
	expect(score.getAccuracy(1,7263,319,0,74)).toBe(96.95); // A
	expect(score.getAccuracy(1,1371,144,0,21)).toBe(93.95); // B
	expect(score.getAccuracy(1,2528,576,0,403)).toBe(80.30); // C
	expect(score.getAccuracy(1,7,7,0,141)).toBe(6.77); // D (Extremely Extremely low acc)
});

// test('should test for accuracy calculation (catch ruleset)', () => {
// 	expect(score.getAccuracy(2,233,26,116,0,0)).toBe(100); // SS
// 	expect(score.getAccuracy(2,691,0,241,13,0)).toBe(98.11); // S
// 	expect(score.getAccuracy(2,690, 30, 269 ,25, 0)).toBe(94.46); // A
// 	expect(score.getAccuracy(0,730,27,142,64, 0)).toBe(90.90); // B
// 	expect(score.getAccuracy(0,724, 0, 207, 115, 0)).toBe(86.77); // C
// 	expect(score.getAccuracy(2,480,46,284,156,0)).toBe(74.04); // D (low acc)
// });

// test('should test for accuracy calculation (mania ruleset)', () => {
// 	expect(score.getAccuracy(3,387,0,0,0,38,349)).toBe(100); // SS
// 	expect(score.getAccuracy(3,691,264,48,20,0)).toBe(98.11); // S
// 	expect(score.getAccuracy(3,690, 30, 269 ,25, 0)).toBe(94.46); // A
// 	expect(score.getAccuracy(3,730,27,142,64, 0)).toBe(90.90); // B
// 	expect(score.getAccuracy(3,724, 0, 207, 115, 0)).toBe(86.77); // C
// 	expect(score.getAccuracy(3,480,46,284,156,0)).toBe(74.04); // D (low acc)
// });

test('should test for string input', () => {
	expect(score.getAccuracy(0,'2838', 275, '43','45')).toBe(91.75);
	expect(score.getAccuracy(0,'1740', '239', '14','31')).toBe(90.02);
});

test('should test for invalid rulesets', () => {
	expect(score.getAccuracy(1000,0,0,0,0,0,0)).toBe(-1);
	expect(score.getAccuracy(-1203,0,0,0,0,0,0)).toBe(-1); 
	expect(score.getAccuracy(Infinity,0,0,0,0)).toBe(-1);
	expect(score.getAccuracy(1.2,0,0,0,0)).toBe(-1);

	expect(score.getRank(2103,false,0,0,0,0)).toBe('-');
	expect(score.getRank(-4937,false,0,0,0,0)).toBe('-'); 
	expect(score.getRank(Infinity,false,0,0,0,0)).toBe('-');
	expect(score.getRank(1.2, false,0,0,0,0)).toBe('-');
});

test('should test for illegal inputs', () => {
	expect(score.getAccuracy(0,'bad', 0, 0, 0)).toBe(-1);
	expect(score.getAccuracy(0, 0, 'bad', 0, 0)).toBe(-1);
	expect(score.getAccuracy(0, 0, 0, 'bad',0)).toBe(-1);
	expect(score.getAccuracy(0, 0, 0, 0,'bad')).toBe(-1);
	expect(score.getAccuracy(0, 'bad','bad','bad','bad')).toBe(-1);

	expect(score.getRank(0,false,'bad', 0, 0, 0)).toBe('-');
	expect(score.getRank(0,false, 0, 'bad', 0, 0)).toBe('-');
	expect(score.getRank(0,false, 0, 0, 'bad',0)).toBe('-');
	expect(score.getRank(0,false, 0, 0, 0,'bad')).toBe('-');
	expect(score.getRank(0,false, 'bad','bad','bad','bad')).toBe('-');
});