export const modes = {
	'0': ['standard', 'std'],
	'1': ['taiko'],
	'2': ['ctb', 'catchthebeat', 'catch'],
	'3': ['mania']
};

export const servers = {
	'0': ['official osu'],
	'1': ['gatari'],
	'2': ['akatsuki']
};

export function getAccuracy(ruleset: number, n300: number | string, n100: number | string, n50: number | string, nmiss: number | string, nkatu: number | string = 0, ngeki: number | string = 0): number {
	n300 = Number(n300);
	nkatu = Number(nkatu);
	ngeki = Number(ngeki);
	n100 = Number(n100);
	n50 = Number(n50);
	nmiss = Number(nmiss);
	
	if (isNaN(n300) || isNaN(n100) ||isNaN(n50) || isNaN(nmiss) || isNaN(nkatu) || isNaN(ngeki)) {
		return -1;	
	}

	if (ruleset == 0) {
		return Math.round((50 * n50 + 100 * n100 + 300 * n300) / (300 * (n50 + n100 + n300 + nmiss)) * 10000) / 100;
	} else if (ruleset == 1) {
		return Math.round(Math.max(0, Math.min(1, (n100 * 150 + n300 * 300) / ((n300 + n100 + n50 + nmiss) * 300))) * 10000) / 100;
	} else if (ruleset == 2) {
		return Math.round(Math.max(0, Math.min(1, (n50 + n100 + n300) / (n50 + n100 + n300 + nmiss + nkatu))) * 10000) / 100;
	} else if (ruleset == 3) {
		return Math.round(Math.max(0, Math.min(1, (n50 * 50 + n100 * 100 + nkatu * 200 + (ngeki + n300) * 300) / ((n50 + n100 + n300 + nmiss + ngeki + nkatu) * 300))) * 10000) / 100;
	}

	return -1;
}

export function getRank(ruleset: number, hidden: boolean, n300: number | string, n100: number | string, n50: number | string, nmiss: number | string): string {
	n300 = Number(n300);
	n100 = Number(n100);
	n50 = Number(n50);
	nmiss = Number(nmiss);

	if (isNaN(n300) || isNaN(n100) ||isNaN(n50) || isNaN(nmiss)) {
		return '-';	
	}

	var percentage300 = (n300 / (n300 + n100 + n50 + nmiss));
	var percentage50 = (n50 / (n300 + n100 + n50 + nmiss));

	if (ruleset == 0) {
		if (percentage300 == 1) {
			return (hidden ? 'xh' : 'x');
		} else if (percentage300 > 0.9 && percentage50 < 0.01 && nmiss == 0) {
			return (hidden ? 'sh' : 's');
		} else if ((percentage300 > 0.8 && nmiss == 0) || percentage300 > 0.9) {
			return 'a';
		} else if ((percentage300 > 0.7 && nmiss == 0) || percentage300 > 0.8) {
			return 'b';
		} else if (percentage300 > 0.6) {
			return 'c';
		}

		return 'd';
	} else if (ruleset == 1) {
		return 'f';
	} else if (ruleset == 2) {
		return 'f';
	} else if (ruleset == 3) {
		return 'f';
	}

	return '-';
}

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

export function getServer(serverType : string, getIndex = false) : string {
	if (getIndex) {
		if (modes['0'].includes(serverType)) return '0';
		if (modes['1'].includes(serverType)) return '1';
		if (modes['2'].includes(serverType)) return '2';
		return '-1';
	}

	if (serverType == '0') return 'offical osu';
	if (serverType == '1') return 'gatari';
	if (serverType == '2') return 'akatsuki';
	return '-1';
}

export function getDifficultyName(ruleset : number, stars : number) {
	if (stars < 2) {
		return'easy';
	} else if (stars < 2.7) {
		return'normal';
	} else if (stars < 4) {
		return'hard';
	} else if (stars < 5.3) {
		return'insane';
	} else if (stars < 6.5) {
		return'expert';
	} else {
		return'extra';
	}
}