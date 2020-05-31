export const modes = {
	'0': ['standard', 'std'],
	'1': ['taiko'],
	'2': ['ctb', 'catchthebeat', 'catch'],
	'3': ['mania']
};

function getAccuracy() { }

function getRank() { }

export function getRuleset(ruleset: string, getIndex = false): string {

	if (getIndex) {
		if (modes['0'].includes(ruleset)) return '0';
		if (modes['1'].includes(ruleset)) return '1';
		if (modes['2'].includes(ruleset)) return '2';
		if (modes['3'].includes(ruleset)) return '3';
		return '-1';
	}

	if (ruleset == '0') return 'standard';
	if (ruleset == '1') return 'taiko';
	if (ruleset == '2') return 'catch';
	if (ruleset == '3') return 'mania';
	return '-1';


}