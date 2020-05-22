'use strict';

const error = require('./error');
const ojsama = require('ojsama');
const mods = require('../handlers/mods');
const database = require('../handlers/database');

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

module.exports = {
	parse: parse,
	parseOjsama: parseOjsama,
	determineUser: determineUser
};