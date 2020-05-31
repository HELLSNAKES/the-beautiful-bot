'use strict';

export const modes : any = {
	'0' : 'Standard',
	'1': 'Taiko',
	'2': 'Catch',
	'3': 'Mania'

};

export function userURL(url: string): any {
	var returnObject: any = {
		userId: null,
		success: true
	};
	var pattern = /^(http(s)?:\/\/)?osu.ppy.sh\/(users|u)\/\d+/g;
	var patternWithoutDigits = /^(http(s)?:\/\/)?osu.ppy.sh\/(users|u)\//g;
	if (pattern.test(url)) {
		console.log();
		returnObject.userId = url.match(pattern)![0].replace(patternWithoutDigits, '');
	} else {
		returnObject.success = false;
	}
	return returnObject;
}