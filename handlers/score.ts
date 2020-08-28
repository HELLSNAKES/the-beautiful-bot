export const modes = {
	'0': ['standard', 'std'],
	'1': ['taiko'],
	'2': ['ctb', 'catchthebeat', 'catch'],
	'3': ['mania']
};

export const servers = {
	'0': ['official osu!'],
	'1': ['gatari'],
	'2': ['akatsuki']
};

export function getAccuracy(ruleset: number, n300: number | string, n100: number | string, n50: number | string, nmiss: number | string, nkatu: number | string = 0, ngeki: number | string = 0, round = true ): number {
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
		const accuracy = ((50 * n50 + 100 * n100 + 300 * n300) / (300 * (n50 + n100 + n300 + nmiss)) * 100);
		return round ? Math.round(accuracy * 100) / 100 : accuracy;
	} else if (ruleset == 1) {
		const accuracy = (Math.max(0, Math.min(1, (n100 * 150 + n300 * 300) / ((n300 + n100 + n50 + nmiss) * 300))) * 100);
		return round ? Math.round(accuracy * 100) / 100 : accuracy;
	} else if (ruleset == 2) {
		const accuracy = (Math.max(0, Math.min(1, (n50 + n100 + n300) / (n50 + n100 + n300 + nmiss + nkatu))) * 100);
		return round ? Math.round(accuracy * 100) / 100 : accuracy;
	} else if (ruleset == 3) {
		const accuracy = (Math.max(0, Math.min(1, (n50 * 50 + n100 * 100 + nkatu * 200 + (ngeki + n300) * 300) / ((n50 + n100 + n300 + nmiss + ngeki + nkatu) * 300))) * 100);
		return round ? Math.round(accuracy * 100) / 100 : accuracy;
	}

	return -1;
}

export function getRank(ruleset: number, hidden: boolean, n300: number | string, n100: number | string, n50: number | string, nmiss: number | string, nkatu?: number | string, ngeki?: number | string): string {
	n300 = Number(n300);
	n100 = Number(n100);
	n50 = Number(n50);
	nmiss = Number(nmiss);
	
	if (isNaN(n300) || isNaN(n100) ||isNaN(n50) || isNaN(nmiss)) {
		return '-';	
	}
	
	const percentage300 = (n300 / (n300 + n100 + n50 + nmiss));
	const percentage50 = (n50 / (n300 + n100 + n50 + nmiss));
	const accuracy = getAccuracy(ruleset, n300, n100, n50, nmiss, nkatu, ngeki);

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
		if (accuracy == 100) {
			return (hidden ? 'xh' : 'x');
		} else if (accuracy < 100 && accuracy > 98) {
			return (hidden ? 'sh' : 's');
		} else if (accuracy <= 98 && accuracy > 94) {
			return 'a';
		} else if (accuracy <= 94 && accuracy > 90) {
			return 'b';
		} else if (accuracy <= 90 && accuracy > 85) {
			return 'c';
		}

		return 'd';
	} else if (ruleset == 3) {
		if (accuracy == 100) {
			return (hidden ? 'xh' : 'x');
		} else if (accuracy > 95) {
			return (hidden ? 'sh' : 's');
		} else if (accuracy > 90) {
			return 'a';
		} else if (accuracy > 80) {
			return 'b';
		} else if (accuracy > 70) {
			return 'c';
		}

		return 'd';
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