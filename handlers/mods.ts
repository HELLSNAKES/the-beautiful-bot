const modsNames = ['MI', 'V2', '2K', '3K', '1K', 'CO', '9K', 'CN', 'RD', 'FI', '8K', '7K', '6K', '5K', '4K', 'PF', 'AP', 'SO', 'AO', 'FL', 'NC', 'HT', 'RX', 'DT', 'SD', 'HR', 'HD', 'TD', 'EZ', 'NF'];
const modsValues = [1073741824, 536870912, 268435456, 134217728, 67108864, 33554432, 16777216, 4194304, 2097152, 1048576, 524288, 262144, 131072, 65536, 32768, 16416, 8192, 4096, 2048, 1024, 576, 256, 128, 64, 32, 16, 8, 4, 2, 1];

export function toString(number: number, returnNoMod = true): string {
	if (number == 0) {
		return (returnNoMod ? 'No Mod' : '');
	}
	let mods = [];
	for (let i = 0; i < modsNames.length; i++) {
		if (number == 0) break;
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

export function has(mods : string | number, find : string) {
	if (typeof mods == 'string' && isNaN(Number(mods))) {
		// Split "find" to a collection of two character segments and check whether every "find" segment is in "mods"
		return find.match(/.{1,2}/g)!.every((x : string) => mods.includes(x));
	} else {
		// Use the AND bitwise operator to check if the bits in find are in mods and check if the value is truthy
		return find.match(/.{1,2}/g)!.every((x) => !!(Number(mods) & toValue(x)));
	}
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
		if (has(mods, 'EZ')) scoreMultiplier *= 0.5;
		if (has(mods, 'NF')) scoreMultiplier *= 0.5;
		if (has(mods, 'HT')) scoreMultiplier *= 0.5;
		return scoreMultiplier;
	}

	return 0;
}