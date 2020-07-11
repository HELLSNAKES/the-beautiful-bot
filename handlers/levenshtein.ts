export function getDistance(a : string, b : string): any {
	if (a.length == 0) return b.length;
	if (b.length == 0) return a.length;

	var matrix = [];

	var i;
	for (i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}

	var j;
	for (j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}

	for (i = 1; i <= b.length; i++) {
		for (j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) == a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1,
					Math.min(matrix[i][j - 1] + 1,
						matrix[i - 1][j] + 1)); 
			}
		}
	}

	return matrix[b.length][a.length];
}

// export function getEdits(a, b) {
// 	var insertion = '**';
// 	var substitution = '**';
// 	var deletion = '~~';


// }

export function getBestMatch(stringArray : Array<string>, compareString : string) {
	var bestMatch = {
		string: '',
		distance: Infinity,
	};

	for (var i = 0; i < stringArray.length; i++) {
		let curr = getDistance(compareString, stringArray[i]);
		if (curr < bestMatch.distance) {
			bestMatch = {
				string: stringArray[i],
				distance: curr
			};
		}
	}

	return bestMatch;
}

export function getPercentageFromDistance(inputString : string, distance : number) {
	return Math.floor(((inputString.length - distance) / inputString.length) * 1000) / 10;
}