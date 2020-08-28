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
	}).pp).toBeCloseTo(863.2124281634384);

	expect(pp.calculateTaikopp({
		accuracy: 97.72,
		diff_overall: '6',
		difficultyrating: '6.61225',
		maxcombo: '1712',
		count50: '0',
		count100: '78',
		count300: '1634',
		countmiss: '0',
		countkatu: '2',
		countgeki: '35',
		enabled_mods: '16'
	}).pp).toBeCloseTo(342.14951902948746);

	expect(pp.calculateTaikopp({
		accuracy: 99.39,
		diff_overall: '7',
		difficultyrating: '8.38762',
		maxcombo: '2362',
		count50: '0',
		count100: '29',
		count300: '2333',
		countmiss: '0',
		countkatu: '0',
		countgeki: '3',
		enabled_mods: '8'
	}).pp).toBeCloseTo(561.940377767731);

	expect(pp.calculateTaikopp({
		accuracy: 98.6,
		diff_overall: '7.5',
		difficultyrating: '8.0958',
		maxcombo: '2459',
		count50: '0',
		count100: '69',
		count300: '2390',
		countmiss: '0',
		countkatu: '0',
		countgeki: '30',
		enabled_mods: '0'
	}).pp).toBeCloseTo(469.05519278782356);

});

test('should test for valid catch pp values',() => {
	expect(pp.calculateCatchpp({
		accuracy: 99.93,
		diff_approach: '10',
		difficultyrating: '9.24103',
		maxcombo: '1387',
		count50: '85',
		count100: '62',
		count300: '1357',
		countmiss: '1',
		countkatu: '0',
		countgeki: '235',
		enabled_mods: '0',
		max_combo: '1420'
	}).pp).toBeCloseTo(1038.2854595449672);

	expect(pp.calculateTaikopp({
		accuracy: 97.72,
		diff_overall: '6',
		difficultyrating: '6.61225',
		maxcombo: '1712',
		count50: '0',
		count100: '78',
		count300: '1634',
		countmiss: '0',
		countkatu: '2',
		countgeki: '35',
		enabled_mods: '16'
	}).pp).toBeCloseTo(342.14951902948746);

	expect(pp.calculateTaikopp({
		accuracy: 99.39,
		diff_overall: '7',
		difficultyrating: '8.38762',
		maxcombo: '2362',
		count50: '0',
		count100: '29',
		count300: '2333',
		countmiss: '0',
		countkatu: '0',
		countgeki: '3',
		enabled_mods: '8'
	}).pp).toBeCloseTo(561.940377767731);

	expect(pp.calculateTaikopp({
		accuracy: 98.6,
		diff_overall: '7.5',
		difficultyrating: '8.0958',
		maxcombo: '2459',
		count50: '0',
		count100: '69',
		count300: '2390',
		countmiss: '0',
		countkatu: '0',
		countgeki: '30',
		enabled_mods: '0'
	}).pp).toBeCloseTo(469.05519278782356);

});