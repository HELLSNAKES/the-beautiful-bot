function toString(number) {
	if (number == 0) {
		return ('No Mod');
	}
	var modsNames = ['PF', 'SO', 'FL', 'NC', 'HT', 'RX', 'DT', 'SD', 'HR', 'HD', 'EZ', 'NF'];
	var modsValues = [16416, 4096, 1024, 576, 256, 128, 64, 32, 16, 8, 2, 1];
	var mods = [];
	for (var i = 0; i < modsNames.length; i++) {
		if (number >= modsValues[i]) {
			number -= modsValues[i];
			mods.push(modsNames[i]);
		}
	}
	return (mods.reverse().join(''));
}

module.exports = {
	toString: toString
};