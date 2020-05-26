'use strict';

const error = require('./error');
const ojsama = require('ojsama');
const mods = require('../handlers/mods');
const database = require('../handlers/database');

const args = [{
	name: 'previous',
	description: 'Show the specificed previous play',
	allowedValues: '0-49'
}, {
	name: 'mode',
	description: 'Specify the osu! mode',
	allowedValues: {
		'0': 'Standard `(Default)`',
		'1': 'Taiko',
		'2': 'Catch',
		'3': 'Mania'
	}
}, {
	name: 'type',
	description: 'Specify the server to pull data from',
	allowedValues: {
		'0': 'Offical Servers `(Default)`',
		'1': 'Gatari Servers',
		'2': 'Akatsuki Servers'
	}
}, {
	name: 'relax',
	description: 'Show relax plays `(Akatsuki Only)`'
}, {
	name: 'mods',
	description: 'Filter plays by mods',
	allowedValues: '\n`mod abbreviations` : only show plays with the exact mod combination e.g. `HDDT`\nadding a `!` at the start will show any play with the mod combination + any other mods e.g. `!HDDT`'
}];

const otherArgs = [{
	name: 'Username',
	description: 'The osu! username or a discord ping (their account must be linked) of the player to run the command on. `By default` if no name was provided, the linked osu! username of the user using the command will be used (refer to `$set`)',
}, {
	name: 'Command',
	description: 'The command to show more information on. If no command was provided the bot will alternatively show the full list of commands available'
}, {
	name: 'Term',
	description: 'A term to search for, this can be anything from beatmap name, artist, mapper or tags.\n\nNote: this command is deprecated and very unstable and soon will get completely revamped'
}, {
	name: 'Gamemode',
	description: 'The gamemode to set as your default. This gamemode will be the default gamemode when using commands such as $recent, $best, etc if no gamemode is specified.\n`0` | `standard` | `std`\n`1` | `taiko`\n`2` | `catch` | `ctb` | `catch the beat`\n`3` | `mania`'
}];

const preformancePointsArgs = [{
	name: '[accuracy]%',
	description: 'show the pp for the specified accuracy `100% by Default` e.g. `$pp 85%`',
	noInitialPrefix: true
}, {
	name: '+[mods]',
	description: 'show the pp for the specified mods applied `No Mod by Default` e.g `$pp +HDHR`',
	noInitialPrefix: true
}, {
	name: '[misses]m',
	description: 'show the pp for the specified number of misses `0 misses by Default` e.g. `$pp 2m`',
	noInitialPrefix: true
}, {
	name: '[combo]x',
	description: 'show the pp for the specified combo `Full Combo by Default` e.g. `$pp 210x`',
	noInitialPrefix: true
}];

function parse(msg, args) {
	var options = {
		previous: 0,
		mode: 0,
		type: 0,
		count: 25,
		relax: 0,
		mods: -1,
		modsInclude: false
	};
	for (var i = 0; i < args.length; i++) {
		if (args[i] == '-p') {
			options.previous = parseInt(args[i + 1]);
			options.previous = (typeof options.previous !== 'undefined') ? options.previous : 0;
			args.splice(i, 2);
			i = -1;
		} else if (args[i] == '-m') {
			options.mode = parseInt(args[i + 1]);
			options.mode = (typeof options.mode !== 'undefined') ? options.mode : 0;
			args.splice(i, 2);
			i = -1;
		} else if (args[i] == '-t') {
			options.type = parseInt(args[i + 1]);
			options.type = (typeof options.type !== 'undefined') ? options.type : 0;
			args.splice(i, 2);
			i = -1;
		} else if (args[i] == '-c') {
			options.count = parseInt(args[i + 1]);
			options.count = (typeof options.count !== 'undefined') ? options.count : 0;
			args.splice(i, 2);
			i = -1;
		} else if (args[i] == '-mods') {
			if (args[i + 1].startsWith('!')) {
				args[i + 1] = args[i + 1].replace('!', '');
				options.modsInclude = true;
			}
			options.mods = mods.toValue(args[i + 1]);
			args.splice(i, 2);
		} else if (args[i] == '-rx') {
			options.relax = 1;
			args.splice(i, 1);
			i = -1;
		}

	}

	if ((0 > options.previous || options.previous > 49 || isNaN(options.previous)) ||
		(0 > options.mode || options.mode > 3 || isNaN(options.mode)) ||
		(0 > options.type || options.type > 2 || isNaN(options.type)) ||
		(0 > options.count || options.count > 25 || isNaN(options.count))) {
		error.log(msg, 4045);
		return ({
			error: 4045
		});
	}
	return (options);
}

function parseOjsama(args) {
	var output = {};
	var argv = args.split(' ');

	for (var i = 0; i < argv.length; ++i) {
		if (argv[i].startsWith('+')) {
			output.mods = ojsama.modbits.from_string(argv[i].slice(1) || '');
		} else if (argv[i].endsWith('%')) {
			output.accuracy = parseFloat(argv[i]);
		} else if (argv[i].endsWith('x')) {
			output.combo = parseInt(argv[i]);
		} else if (argv[i].endsWith('m')) {
			output.misses = parseInt(argv[i]);
		}
	}

	return output;
}

function determineUser(msg, args, callback) {
	var argsString = args.join(' ');
	var options = parse(msg, args);
	if (options.error) return;

	if (/<@![0-9]{18}>/g.test(args[0])) {
		var discordID = args[0].slice(3, 21);
		database.read('users', {
			discordID: discordID
		}, (docs, err) => {
			if (err || Object.entries(docs).length == 0) {
				error.log(msg, 4046);
				return;
			}
			options.mode = argsString.includes('-m') ? options.mode : docs[0].mode;
			options.type = docs[0].type;
			callback(docs[0].osuUsername, options);
		});
	} else if (args.length != 0) {
		callback(args.join('_'), options);
	} else {
		database.read('users', {
			discordID: msg.author.id
		}, (docs, err) => {
			if (err || Object.entries(docs).length == 0) {
				error.log(msg, 4046);
				return;
			}
			options.mode = argsString.includes('-m') ? options.mode : docs[0].mode;
			options.type = docs[0].type;
			callback(docs[0].osuUsername, options);
		});
	}
}

function getArgumentDetails(argsArray) {
	var returnArray = [];

	for (var i = 0; i < argsArray.length; i++) {
		for (var j = 0; j < args.length; j++) {
			if (args[j].name.toLowerCase() == argsArray[i].toLowerCase()) returnArray.push(args[j]);
		}
	}

	return returnArray;
}

function getOtherArgumentDetails(argsArray) {
	var returnArray = [];

	for (var i = 0; i < argsArray.length; i++) {
		for (var j = 0; j < otherArgs.length; j++) {
			if (otherArgs[j].name == argsArray[i]) returnArray.push(otherArgs[j]);
		}
	}

	return returnArray;
}

function getPerformancePointsArgumentDetails(argsArray) {
	if (argsArray == undefined) {
		return preformancePointsArgs;
	}

	var returnArray = [];

	for (var i = 0; i < argsArray.length; i++) {
		for (var j = 0; j < otherArgs.length; j++) {
			if (preformancePointsArgs[j].name == argsArray[i]) returnArray.push(preformancePointsArgs[j]);
		}
	}

	return returnArray;
}

module.exports = {
	parse: parse,
	parseOjsama: parseOjsama,
	determineUser: determineUser,
	getArgumentDetails: getArgumentDetails,
	getOtherArgumentDetails: getOtherArgumentDetails,
	getPerformancePointsArgumentDetails: getPerformancePointsArgumentDetails

};