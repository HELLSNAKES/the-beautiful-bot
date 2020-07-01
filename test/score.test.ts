/* eslint-disable no-undef */

import * as score from '../handlers/score';

test('should test for accuracy calculation (osu ruleset)', () => {
	expect(score.getAccuracy(0,1227,0,0,0,1024,203)).toBe(100); // S
	expect(score.getAccuracy(0,789,24,0,11)).toBe(96.72); // A
	expect(score.getAccuracy(0,783,15,0,5)).toBe(98.13); // A
	expect(score.getAccuracy(0,1134,190,15,58)).toBe(85.89); // B
	expect(score.getAccuracy(0,1769,460,125,88)).toBe(79.57); // C
	expect(score.getAccuracy(0,2,4,4,8)).toBe(22.22); // D (Extremely Extremely low acc)

});

test('should test for invalid rulesets', () => {
	expect(score.getAccuracy(1000,1200,0,0,0,500,700)).toBe(-1);
	expect(score.getAccuracy(-1203,1227,0,0,0,1024,203)).toBe(-1); 
	expect(score.getAccuracy(Infinity,789,24,0,11)).toBe(-1);
	expect(score.getAccuracy(1.2,789,24,0,11)).toBe(-1);
});