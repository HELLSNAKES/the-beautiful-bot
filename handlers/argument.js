const error = require('./error');
const ojsama = require('ojsama');

function parse(msg, args) {
	var options = {
		previous: 0,
		mode: 0,
		type: 0,
		count: 25,
		relax: 0
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

module.exports = {
	parse: parse,
	parseOjsama: parseOjsama
};