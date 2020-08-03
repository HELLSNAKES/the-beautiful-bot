/* eslint-disable no-undef */

import * as utility from '../handlers/utility';

const maxAge = 20000; // 20 seconds max age for each test

test('should test for valid osu usernames and user ids', () => {
	const promises = [
		// usernames
		utility.checkUser('Moorad', 0),
		utility.checkUser('MooradAltamimi', 0), // Checking for name changes
		utility.checkUser('My Angel Koishi', 0),
		utility.checkUser('--Kager--', 0),
		utility.checkUser('Nines', 0),
		utility.checkUser('xVoltex', 0),
		utility.checkUser('Applett', 0),
		// user ids
		utility.checkUser('8773926', 0),
		utility.checkUser('10627594', 0),
		utility.checkUser('3047470', 0),
		utility.checkUser('3906405', 0),
		utility.checkUser('2552141', 0),
		utility.checkUser('9184180', 0)
	];

	const expected = [
		'14392546',
		'14392546',
		'8273098',
		'8305894',
		'2696453',
		'10336882',
		'11184264',
		'8773926',
		'10627594',
		'3047470',
		'3906405',
		'2552141',
		'9184180'
	];

	return expect(Promise.all(promises)).resolves.toEqual(expected);
}, maxAge);

test('should test for valid gatari usernames and user ids', () => {
	const promises = [
		// usernames
		utility.checkUser('Just L', 1),
		utility.checkUser('after', 1),
		utility.checkUser('Tamadori', 1),
		utility.checkUser('Mountain', 1),
		utility.checkUser('-weew', 1),
		utility.checkUser('Lucky13', 1),
		// user ids
		utility.checkUser('4344', 1),
		utility.checkUser('16369', 1),
		utility.checkUser('5232', 1),
		utility.checkUser('5416', 1),
		utility.checkUser('9571', 1),
		utility.checkUser('7712', 1)
	];

	const expected = [
		'17270',
		'15385',
		'2585',
		'13309',
		'2917',
		'1480',
		'4344',
		'16369',
		'5232',
		'5416',
		'9571',
		'7712'
	];

	return expect(Promise.all(promises)).resolves.toEqual(expected);
}, maxAge);

test('should test for valid akatsuki usernames and user ids', () => {
	const promises = [
		// usernames
		utility.checkUser('_byte', 2),
		utility.checkUser('xGameOG', 2),
		utility.checkUser('-[]', 2),
		utility.checkUser('- Aikawa -', 2),
		utility.checkUser('my angel akia', 2),
		utility.checkUser('T3relax', 2),
		// (user ids are not supported for akatsuki)
	];

	const expected = [
		'25586',
		'5304',
		'21490',
		'2769',
		'32142',
		'34358'
	];

	return expect(Promise.all(promises)).resolves.toEqual(expected);
}, maxAge);

// Restricted players (This is sometimes not removed from osu's API so I will comment it out for now)

// test('should test for restricted players (1)', () => {
// 	return expect(utility.checkUser('Kimmy-', 0)).rejects.toEqual(new Error('No user with the specified username/user id was found'));
// }, maxAge);

// test('should test for restricted players (2)', () => {
// 	return expect(utility.checkUser('DendyHere', 0)).rejects.toEqual(new Error('No user with the specified username/user id was found'));
// }, maxAge);

// test('should test for restricted players (3)', () => {
// 	return expect(utility.checkUser('Hoshinomori', 0)).rejects.toEqual(new Error('No user with the specified username/user id was found'));
// }, maxAge);


// Invalid usernames

test('should test for invalid usernames (1)', () => {
	return expect(utility.checkUser('sldksldksldkskdlsdks', 0)).rejects.toEqual(new Error('No user with the specified username/user id was found'));
}, maxAge);

test('should test for invalid usernames (2)', () => {
	return expect(utility.checkUser('qwopk2mknlkfjdlkfnsmd sojdosjoijewieo', 1)).rejects.toEqual(new Error('No user with the specified username/user id was found'));
}, maxAge);

test('should test for invalid usernames (3)', () => {
	return expect(utility.checkUser('ppppppswwwwwwwww9999999sssss22222-----', 0)).rejects.toEqual(new Error('No user with the specified username/user id was found'));
}, maxAge);

// Invalid server types

test('should test for invalid server types (1)', () => {
	return expect(utility.checkUser('Moorad', 120129)).rejects.toEqual(new Error('Invalid server type'));
}, maxAge);

test('should test for invalid server types (2)', () => {
	return expect(utility.checkUser('Moorad', -12000000002)).rejects.toEqual(new Error('Invalid server type'));
}, maxAge);

test('should test for invalid server types (3)', () => {
	return expect(utility.checkUser('Moorad', Infinity)).rejects.toEqual(new Error('Invalid server type'));
}, maxAge);

test('should test for invalid server types (4)', () => {
	return expect(utility.checkUser('Moorad', 1.02948239)).rejects.toEqual(new Error('Invalid server type'));
}, maxAge);