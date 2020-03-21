const database = require('../handlers/database');
const error = require('../handlers/error');
const format = require('../handlers/format');
const fs = require('fs');
const path = require('path');
const countryCodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../country_codes.json')));
const request = require('request');
const Canvas = require('canvas');
const Discord = require('discord.js');
const gatariData = require('./convert/gatariData');
const akatsukiData = require('./convert/akatsukiData');
const argument = require('../handlers/argument');
Canvas.registerFont('assets/Rubik-Bold.ttf', {
	family: 'rubik-bold'
});

Canvas.registerFont('assets/Rubik-Medium.ttf', {
	family: 'rubik'
});

var time = Date.now();

function osu(msg, args) {
	var options = argument.parse(msg, args);
	if (options.error) return;

	if (/<@![0-9]{18}>/g.test(args[0])) {
		var discordID = args[0].slice(3, 21);
		database.read({
			discordID: discordID
		}, (doc) => {
			if (doc.error) {
				error.log(msg, 4046);
				return;
			}
			requestData(msg, doc.osuUsername, options);
		});
	} else if (args.length != 0) {
		requestData(msg, args.join('_'), options);
	} else {
		database.read({
			discordID: msg.author.id
		}, function (doc) {
			if (doc.error) {
				error.log(msg, 4046);
				return;
			}
			options.type = doc.type;
			requestData(msg, doc.osuUsername, options);
		});
	}
}

function requestData(msg, id, options = {}) {
	options.type = options.type ? options.type : 0;
	if (options.type == 0) {
		request(`https://osu.ppy.sh/api/get_user?k=${process.env.osuAPI}&u=${id}`, {
			json: true
		}, async (err, res, body) => {
			generateUser(msg, 0, body);
		});
	} else if (options.type == 1) {
		request(`https://api.gatari.pw/user/stats?u=${id}`, {
			json: true
		}, (err, res, body) => {
			request(`https://api.gatari.pw/users/get?u=${id}`, {
				json: true
			}, (err, res, bodyInfo) => {
				generateUser(msg, 1, [gatariData.userData(body, bodyInfo)]);
			});
		});
	} else if (options.type == 2) {
		request(`https://akatsuki.pw/api/v1/users/${options.relax ? 'rx' : ''}full?name=${id}`, {
			json: true
		}, (err, res, body) => {
			generateUser(msg, 2, [akatsukiData.userData(body)]);
		});
	}
}

async function generateUser(msg, type, body) {
	if (body == undefined || body.length == 0) {
		error.log(msg, 4041);
		return;
	}
	var canvas = Canvas.createCanvas(1200, 624);
	var ctx = canvas.getContext('2d');

	ctx.beginPath();
	ctx.fillStyle = '#303F76';
	format.rect(ctx, 0, 0, canvas.width, canvas.height, 45);
	ctx.fill();

	let backgroundImage = await Canvas.loadImage(path.resolve(__dirname, '../assets/background.png'));
	ctx.shadowColor = 'rgba(0,0,0,0.5)';
	ctx.shadowBlur = 40;
	ctx.save();
	format.rect(ctx, 0, 0, canvas.width, 432, 45);
	ctx.clip();
	ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height + 71);
	ctx.restore();
	ctx.shadowBlur = 0;
	ctx.save();

	var userPictureUrl = `https://a.ppy.sh/${body[0].user_id}?${Date.now().toString()}`;

	if (type == 1) {
		userPictureUrl = `https://a.gatari.pw/${body[0].user_id}?${Date.now().toString()}`;
	} else if (type == 2) {
		userPictureUrl = `https://a.akatsuki.pw/${body[0].user_id}?${Date.now().toString()}`;
	}
	var userPicture;
	try {
		userPicture = await Canvas.loadImage(userPictureUrl);
	} catch (err) {
		userPicture = await Canvas.loadImage('https://osu.ppy.sh/images/layout/avatar-guest.png');
	}
	format.rect(ctx, 44, 55, 277, 277, 47);
	ctx.clip();

	var scale = Math.max(280 / userPicture.width, 280 / userPicture.height);
	var x = 170 + 14 - (userPicture.width / 2) * scale;
	var y = 170 + 25 - (userPicture.height / 2) * scale;
	ctx.drawImage(userPicture, x, y, userPicture.width * scale, userPicture.height * scale);
	ctx.restore();

	ctx.fillStyle = '#ffffff';
	ctx.font = '63px rubik-bold';
	ctx.fillText(body[0].username, 347, 56 + 63);



	ctx.font = '40px rubik';
	let country = countryCodes[body[0].country];
	var flag = await Canvas.loadImage(`https://osu.ppy.sh/images/flags/${body[0].country}.png`);
	ctx.drawImage(flag, 350, 130, 60, 40);
	ctx.fillText(country, 420, 127 + 40);

	var gradeA = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_a.png'));
	var gradeS = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_s.png'));
	var gradeSS = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_ss.png'));
	var gradeSH = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_sh.png'));
	var gradeSSH = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_ssh.png'));

	ctx.drawImage(gradeA, 766, 112 + 25, 98, 50);
	ctx.drawImage(gradeS, 922, 112 + 25, 98, 50);
	ctx.drawImage(gradeSH, 1080, 112 + 25, 98, 50);
	ctx.drawImage(gradeSS, 847, 221 + 25, 98, 50);
	ctx.drawImage(gradeSSH, 1002, 221 + 25, 98, 50);

	ctx.font = '28px rubik';
	ctx.textAlign = 'center';
	ctx.fillText(format.number(body[0].count_rank_a), 792 + 22, 171 + 25 + 28);
	ctx.fillText(format.number(body[0].count_rank_s), 955 + 16, 171 + 25 + 28);
	ctx.fillText(format.number(body[0].count_rank_sh), 1108 + 22, 171 + 25 + 28);
	ctx.fillText(format.number(body[0].count_rank_ss), 888 + 9, 279 + 25 + 28);
	ctx.fillText(format.number(body[0].count_rank_ssh), 1038 + 13, 279 + 25 + 28);

	ctx.textAlign = 'left';
	ctx.font = '75px rubik';
	ctx.fillText('#' + format.number(body[0].pp_rank), 347, 170 + 75);

	ctx.font = '57px rubik';
	ctx.fillText('#' + format.number(body[0].pp_country_rank), 347, 259 + 57);

	var hexagon = await Canvas.loadImage(path.resolve(__dirname, '../assets/hexagon.png'));
	ctx.drawImage(hexagon, 342, 332, 72, 77);

	ctx.textAlign = 'center';
	ctx.font = '33px rubik';
	ctx.fillText(Math.floor(body[0].level), 378, 332 + 50);

	format.rect(ctx, 441, 364, 504, 12, 7);
	ctx.fillStyle = '#FFCC22';
	format.rect(ctx, 441, 364, 504 * (body[0].level - Math.floor(body[0].level) > 0.02 ? body[0].level - Math.floor(body[0].level) : 0.02), 12, 7);
	ctx.textAlign = 'left';
	ctx.fillStyle = '#ffffff';
	ctx.font = '21px rubik';
	ctx.fillText(Math.floor(100 * (body[0].level - Math.floor(body[0].level))) + '%', 960, 359+ 21);

	ctx.fillStyle = '#ffffff21';
	format.rect(ctx, 44, 472, 191, 53, 30);
	format.rect(ctx, 278, 472, 232, 53, 30);
	format.rect(ctx, 547, 472, 306, 53, 30);
	format.rect(ctx, 897, 472, 250, 53, 30);


	ctx.fillStyle = '#ffffff';
	ctx.textAlign = 'center';
	ctx.font = '30px rubik-bold';
	ctx.fillText('pp', 118 + 20, 476 + 30);
	ctx.fillText('Accuracy', 314 + 80, 478 + 30);
	ctx.fillText('Hours Played', 592 + 110, 476 + 30);
	ctx.fillText('Score', 973 + 50, 478 + 30);

	ctx.font = '40px rubik';
	ctx.fillText(format.number(Math.floor(body[0].pp_raw)), 82 + 60, 534 + 40);
	ctx.fillText(Math.floor(body[0].accuracy * 100) / 100 + '%', 324 + 75, 537 + 40);
	ctx.fillText(format.number(Math.floor(body[0].total_seconds_played / 60 / 60)) + 'h', 651 + 50, 536 + 40);
	ctx.fillText(format.numberSuffix(body[0].total_score), 930 + 100, 536 + 40);

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'user_stats.png');
	msg.channel.send(attachment);
	console.log(`GENERATED USER CARD : ${msg.author.id} : https://osu.ppy.sh/users/${body[0].user_id} : ${Date.now() - time}ms`);
}


module.exports = {
	osu: osu,
	requestData: requestData,
	generateUser: generateUser
};