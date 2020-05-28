'use strict';

const error = require('./error');
const ojsama = require('ojsama');
const mods = require('../handlers/mods');
const database = require('../handlers/database');

// isSwitch: (boolean) whether the argument takes a value after it
// aliases: (string array) a list of aliases
// validator: (function) used to validate the value after the argument
// validatorText: (string) used for errors if the validator returned false (will be deprecated soon)
// name: (string)
// allowedValues: (string || object)
// default: (any)
// description: (string)
// process: (function)

const args = [{
	name: 'previous',
	description: 'Show the specificed previous play',
	allowedValues: '0-49',
	aliases: ['p'],
	validator: x => !isNaN(x) && x >= 0 && x < 50,
	validatorText: 'a value  between `0` and `49`',
	process: x => parseInt(x),
	default: 0
}, {
	name: 'mode',
	description: 'Specify the osu! mode',
	allowedValues: {
		'0': 'Standard `(Default)`',
		'1': 'Taiko',
		'2': 'Catch',
		'3': 'Mania'
	},
	aliases: ['m'],
	validator: x => x == 0 || x == 1 || x == 2 || x == 3,
	validatorText: '`0`, `1`, `2` or `3`',
	process: x => parseInt(x),
	default: 0
}, {
	name: 'type',
	description: 'Specify the server to pull data from',
	allowedValues: {
		'0': 'Offical Servers `(Default)`',
		'1': 'Gatari Servers',
		'2': 'Akatsuki Servers'
	},
	aliases: ['t'],
	validator: x => x == 0 || x == 1 || x == 2,	
	validatorText: '`0`, `1` or `2`',
	process: x => parseInt(x),
	default: 0
}, {
	name: 'relax',
	description: 'Show relax plays `(Akatsuki Only)`',
	aliases: ['rx'],
	isSwitch: true,
	default: false
}, {
	name: 'mods',
	description: 'Filter plays by mods',
	allowedValues: '\n`mod abbreviations` : only show plays with the exact mod combination e.g. `HDDT`\nadding a `!` at the start will show any play with the mod combination + any other mods e.g. `!HDDT`',
	process: (x) => [x.startsWith('!'), mods.toValue(x.replace('!', ''))],
	default: [false, -1]
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

function parse(msg, passedArgs) {
	var options = {
		error: false
	};

	for (var x of args) {
		if (x.default != undefined) options[x.name] = x.default;
	}

	for (var i = 0; i < passedArgs.length; i++) {

		if (!passedArgs[i].startsWith('-')) continue;

		let found = false;

		for (var j = 0; j < args.length; j++) {
			if (passedArgs[i].toLowerCase().slice(1) == args[j].name ||
				(args[j].aliases && args[j].aliases.includes(passedArgs[i].toLowerCase().slice(1)))) {

				found = true;

				if (args[j].isSwitch) {
					options[args[j].name] = true;
					passedArgs.splice(i, 1);
					i = -1;
					break;
				}

				if (i == passedArgs.length - 1 || passedArgs[i + 1].startsWith('-')) {
					msg.channel.send(`:red_circle: \`-${args[j].name}\` must have a value after it\n(If you believe this is a bug or have a suggestion use \`$report [description of bug/suggestion]\`)`);
					options.error = true;
					return options;
				}

				if (args[j].validator && !args[j].validator(passedArgs[i + 1])) {
					msg.channel.send(`:red_circle: \`${passedArgs[i + 1]}\` is an invalid value after \`${passedArgs[i]}\`\n\`-${args[j].name}\` only accepts ${args[j].validatorText}\n(If you believe this is a bug or have a suggestion use \`$report [description of bug/suggestion]\`)`);
					options.error = true;
					return options;
				}

				if (args[j].process) options[args[j].name] = args[j].process(passedArgs[i + 1]);
				else options[args[j].name] = passedArgs[i + 1];

				passedArgs.splice(i, 2);
				i = -1;
				break;
			}
		}

		if (!found) {
			msg.channel.send(`:red_circle: \`${passedArgs[i]}\` is an unrecognised argument\n(If you believe this is a bug or have a suggestion use \`$report [description of bug/suggestion]\`)`);
			options.error = true;
			return options;
		}
	}

	console.log(options);
	return options;
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