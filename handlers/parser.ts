'use strict';

var modes = {
	osu: 0,
	taiko: 1,
	catch: 2,
	fruits: 3
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