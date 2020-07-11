/* eslint-disable no-undef */
import * as pp from '../handlers/pp';

test('should test for valid taiko pp values',() => {
	expect(pp.calculateTaikopp({
		accuracy: 99.16,
		diff_overall: '7',
		difficultyrating: '10.5557',
		maxcombo: '1900',
		count50: '0',
		count100: '32',
		count300: '1868',
		countmiss: '0',
		countkatu: '0',
		countgeki: '0',
		enabled_mods: '72'
	}).pp).toBeCloseTo(863, 0);

	// expect(pp.calculateTaikopp({
	// 	accuracy: 99.20,
	// 	diff_overall: '8.8',
	// 	difficultyrating: '9.26449',
	// 	maxcombo: '1741',
	// 	count50: '0',
	// 	count100: '28',
	// 	count300: '1713',
	// 	countmiss: '0',
	// 	countkatu: '0',
	// 	countgeki: '12',
	// 	enabled_mods: '0'
	// }).pp).toBeCloseTo(605, 0);

	// expect(pp.calculateTaikopp({
	// 	accuracy: 99.16,
	// 	diff_overall: '7',
	// 	difficultyrating: '10.5557',
	// 	maxcombo: '1900',
	// 	count50: '0',
	// 	count100: '32',
	// 	count300: '1868',
	// 	countmiss: '0',
	// 	countkatu: '0',
	// 	countgeki: '0',
	// 	enabled_mods: '72'
	// }).pp).toBeCloseTo(863, 0);

});