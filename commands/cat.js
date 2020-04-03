const request = require('request');

function execute(msg) {
	request('https://api.thecatapi.com/v1/images/search', function (err, res, body) {
		msg.reply(JSON.parse(body)[0].url);
		console.log('CAT :3');
	});
}

module.exports = {
	name: 'cat',
	execute: execute
};