/* eslint-disable no-undef */

import * as score from '../handlers/score';

test('should test for accuracy calculation (osu ruleset)', () => {
	expect(score.getAccuracy(0,1227,0,0,0,1024,203)).toBe(100); // SS
	expect(score.getAccuracy(0,781,22,0,0)).toBe(98.17); // S
	expect(score.getAccuracy(0,783,15,0,5)).toBe(98.13); // A
	expect(score.getAccuracy(0,1134,190,15,58)).toBe(85.89); // B
	expect(score.getAccuracy(0,1769,460,125,88)).toBe(79.57); // C
	expect(score.getAccuracy(0,2,4,4,8)).toBe(22.22); // D (low acc)
});

test('should test for accuracy calculation (taiko ruleset)', () => {
	expect(score.getAccuracy(1,74,0,0,0,0,26)).toBe(100); // SS
	expect(score.getAccuracy(1,992,29,0,0)).toBe(98.58); // S
	expect(score.getAccuracy(1,7263,319,0,74)).toBe(96.95); // A
	expect(score.getAccuracy(1,1371,144,0,21)).toBe(93.95); // B
	expect(score.getAccuracy(1,2528,576,0,403)).toBe(80.30); // C
	expect(score.getAccuracy(1,7,7,0,141)).toBe(6.77); // D (low acc)
});

test('should test for accuracy calculation (catch ruleset)', () => {
	expect(score.getAccuracy(2,252,38,148,0,0)).toBe(100); // SS
	expect(score.getAccuracy(2,1089,6,196,15,9)).toBe(98.17); // S
	expect(score.getAccuracy(2,1618, 21, 507 ,55, 44)).toBe(95.59); // A
	expect(score.getAccuracy(2,1144,261,249,141, 22)).toBe(91.03); // B
	expect(score.getAccuracy(2,1440, 21, 467, 233, 84)).toBe(85.88); // C
	expect(score.getAccuracy(2,406,7,45,1772,245)).toBe(18.51); // D (low acc)
});

test('should test for accuracy calculation (mania ruleset)', () => {
	expect(score.getAccuracy(3,53,0,0,0,0,1347)).toBe(100); // SS
	expect(score.getAccuracy(3,582,13,2,7,89, 631)).toBe(96.45); // S
	expect(score.getAccuracy(3,1103, 56, 6 ,87, 339, 1854)).toBe(92.97); // A
	expect(score.getAccuracy(3,850,93,14,90, 282, 1215)).toBe(89.87); // B
	expect(score.getAccuracy(3,99, 14, 17, 30, 66, 73)).toBe(74.75); // C
	expect(score.getAccuracy(3,513,611,119,1152,777,505)).toBe(47.85); // D (low acc)
});

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