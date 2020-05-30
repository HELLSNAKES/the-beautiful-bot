'use strict';

const modsNames = ['MI', 'V2', '2K', '3K', '1K', 'CO', '9K', 'CN', 'RD', 'FI', '8K', '7K', '6K', '5K', '4K', 'PF', 'AP', 'SO', 'AO', 'FL', 'NC', 'HT', 'RX', 'DT', 'SD', 'HR', 'HD', 'TD', 'EZ', 'NF'];
const modsValues = [1073741824, 536870912, 268435456, 134217728, 67108864, 33554432, 16777216, 4194304, 2097152, 1048576, 524288, 262144, 131072, 65536, 32768, 16416, 8192, 4096, 2048, 1024, 576, 256, 128, 64, 32, 16, 8, 4, 2, 1];

export function toString(number: number, returnNoMod = true): string {
	if (number == 0) {
		return (returnNoMod ? 'No Mod' : '');
	}
	let mods = [];
	for (let i = 0; i < modsNames.length; i++) {
		if (number >= modsValues[i]) {
			number -= modsValues[i];
			mods.push(modsNames[i]);
		}
	}
	return (mods.reverse().join(''));
}

export function toValue(value: string): number {
	value = value.toUpperCase();
	if (value == '' || value == 'No Mod') {
		return 0;
	}
	let mods: Array<string> = value.match(/.{1,2}/g) ?? [];
	let output = 0;
	for (let i = 0; i < mods.length; i++) {
		if (modsNames.includes(mods[i])) {
			output += modsValues[modsNames.indexOf(mods[i])];
		}
	}
	return (output);
}


export function getScoreMultiplier(mods: string, mode: number): number {
	var scoreMultiplier = 1;
	if (mode == 1) {
		return 1;
	} else if (mode == 2) {
		return 1;
	} else if (mode == 3) {
		return 1;
	} else if (mode == 4) {
		if (mods.includes('EZ')) scoreMultiplier *= 0.5;
		if (mods.includes('NF')) scoreMultiplier *= 0.5;
		if (mods.includes('HT')) scoreMultiplier *= 0.5;
		return scoreMultiplier;
	}

	return 0;
}