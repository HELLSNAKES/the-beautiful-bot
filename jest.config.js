module.exports = {
	'transform': {
		'.(ts|tsx)': 'ts-jest'
	},
	'testRegex': '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
	'moduleFileExtensions': [
		'ts',
		'tsx',
		'js'
	],
	'verbose': true,
	'setupFiles': ['dotenv/config'],
	// This should be commented out on release build
	// This is commented to prevent testing tests that 1. take a long time to get an output 2. Fetches information from somewhere outside the bot which can make the tests spammy (This is mainly for Promises, HTTP requests and Database requests)
	'testPathIgnorePatterns' : [ 
		// 'utility.test.ts'
	]
};