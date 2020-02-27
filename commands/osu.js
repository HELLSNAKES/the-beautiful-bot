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
Canvas.registerFont('assets/SegoeUI.ttf', {
	family: 'segoeUI'
});

Canvas.registerFont('assets/SegoeUIBold.ttf', {
	family: 'segoeUIBold'
});


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
			requestData(msg, doc.osuUsername);
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
			requestData(msg, doc.osuUsername, {type: doc.type});
		});
	}
}

function requestData(msg, id, options) {
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
		request(`https://akatsuki.pw/api/v1/users/full?name=${id}`, {
			json: true
		}, (err, res, body) => {
			generateUser(msg, 2, [akatsukiData.userData(body)]);
		})
	}
}

async function generateUser(msg, type, body) {
	if (body.length == 0) {
		error.log(msg, 4041);
		return;
	}

	var canvas = Canvas.createCanvas(1080, 538);
	var ctx = canvas.getContext('2d');

	ctx.beginPath();
	ctx.fillStyle = '#121212';
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();
	// background
	var background = await Canvas.loadImage(path.resolve(__dirname, `../assets/background-${Math.round(Math.random() * 7)}.png`));
	ctx.drawImage(background, 0, 0, canvas.width, 300);
	ctx.save();

	var userPictureUrl = `https://a.ppy.sh/${body[0].user_id}?${Date.now().toString()}`;

	if (type == 1) {
		userPictureUrl = `https://a.gatari.pw/${body[0].user_id}?${Date.now().toString()}`;
	} else if (type == 2) {
		userPictureUrl = `https://a.akatsuki.pw/${body[0].user_id}?${Date.now().toString()}`
	}
	var userPicture;
	try {
		userPicture = await Canvas.loadImage(userPictureUrl);
	} catch (err) {
		userPicture = await Canvas.loadImage('https://osu.ppy.sh/images/layout/avatar-guest.png');
	}
	format.rect(ctx, 30, 30, 280, 280, 47);
	ctx.clip();
	console.log(userPicture.height);

	var scale = Math.max(280 / userPicture.width, 280 / userPicture.height);
    var x = 170 - (userPicture.width / 2) * scale;
    var y = 170 - (userPicture.height / 2) * scale;
    ctx.drawImage(userPicture, x, y, userPicture.width * scale, userPicture.height * scale);
	ctx.restore();

	ctx.fillStyle = '#ffffff';
	ctx.font = '51px segoeUIBold';
	ctx.fillText(body[0].username, 330, 95);

	ctx.font = '40px segoeUI';
	let country = countryCodes[body[0].country];
	ctx.fillText(country, 330, 140);

	var gradeA = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_a.png'));
	var gradeS = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_s.png'));
	var gradeSS = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_ss.png'));
	var gradeSH = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_sh.png'));
	var gradeSSH = await Canvas.loadImage(path.resolve(__dirname, '../assets/grade_ssh.png'));

	ctx.drawImage(gradeSSH, 370, 180, 95, 48);
	ctx.drawImage(gradeSS, 500, 180, 95, 48);
	ctx.drawImage(gradeSH, 630, 180, 95, 48);
	ctx.drawImage(gradeS, 760, 180, 95, 48);
	ctx.drawImage(gradeA, 890, 180, 95, 48);

	ctx.font = '25px segoeUIBold';
	ctx.textAlign = 'center';
	ctx.fillText(format.number(body[0].count_rank_ssh), 417, 260, 95, 48);
	ctx.fillText(format.number(body[0].count_rank_ss), 549, 260, 95, 48);
	ctx.fillText(format.number(body[0].count_rank_sh), 679, 260, 95, 48);
	ctx.fillText(format.number(body[0].count_rank_s), 809, 260, 95, 48);
	ctx.fillText(format.number(body[0].count_rank_a), 939, 260, 95, 48);
	ctx.textAlign = 'left';
	ctx.font = '37px segoeUIBold';
	ctx.fillText('Global Rank', 50, 350);
	ctx.font = '62px segoeUI';
	ctx.fillText('#' + format.number(body[0].pp_rank), 50, 420);

	ctx.font = '20px segoeUIBold';
	ctx.fillText('Country Rank', 50, 450);
	ctx.font = '42px segoeUI';
	ctx.fillText('#' + format.number(body[0].pp_country_rank), 50, 500);

	var hexagon = await Canvas.loadImage(path.resolve(__dirname, '../assets/hexagon.png'));
	ctx.drawImage(hexagon, 340, 271, 70, 76);

	ctx.textAlign = 'center';
	ctx.font = '33px segoeUI';
	ctx.fillText(Math.floor(body[0].level), 375, 320);

	format.rect(ctx, 440, 305, 462, 11, 7);
	ctx.fillStyle = '#FFCC22';
	format.rect(ctx, 440, 305, 462 * (body[0].level - Math.floor(body[0].level)), 11, 7);
	ctx.textAlign = 'left';
	ctx.fillStyle = '#ffffff';
	ctx.font = '21px segoeUI';
	ctx.fillText(Math.floor(100 * (body[0].level - Math.floor(body[0].level))) + '%', 920, 317);

	ctx.fillStyle = '#ffffff11';
	format.rect(ctx, 350, 380, 150, 115, 30);
	format.rect(ctx, 565, 380, 180, 115, 30);
	format.rect(ctx, 790, 380, 240, 115, 30);

	ctx.fillStyle = '#ffffff';
	ctx.textAlign = 'center';
	ctx.font = '30px segoeUIBold';
	ctx.fillText('pp', 425, 418);
	ctx.fillText('Accuracy', 655, 418);
	ctx.fillText('Playtime', 908, 418);
	ctx.font = '35px segoeUI';
	ctx.fillText(format.number(Math.floor(body[0].pp_raw)), 425, 468);
	ctx.fillText(Math.floor(body[0].accuracy * 100) / 100 + '%', 655, 468);
	ctx.fillText(format.number(Math.floor(body[0].total_seconds_played / 60 / 60)) + 'h', 908, 468);

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'user_stats.png');
	msg.channel.send(attachment);
	console.log(`GENERATED USER CARD : ${msg.author.id} : https://osu.ppy.sh/users/${body[0].user_id}`);
}


module.exports = {
	osu: osu,
	generateUser: generateUser
};