import { Message } from 'discord.js';
import { IOptions, IAPIUser } from '../handlers/interfaces';

import * as format from '../handlers/format';
import * as argument from '../handlers/argument';
import * as error from '../handlers/error';
import * as utility from '../handlers/utility';
import * as API from '../handlers/API';
import * as score from '../handlers/score';

const path = require('path');
const { registerFont, createCanvas, loadImage } = require('canvas');
const Discord = require('discord.js');

var countryCodes = require('../country_codes.json');

registerFont(path.resolve(__dirname, '../assets/VarelaRound.ttf'), {
	family: 'VarelaRound'
});
var time = Date.now();

function execute(msg: Message, args: Array<string>, mode: number | undefined = 0) {
	argument.determineUser(msg, args, (user, options) => {
		options.mode = mode;
		requestData(msg, user, options);
	});
}

function requestData(msg: Message, user: string | undefined, options: IOptions = {
	error: false,
	mode: 0
}) {
	options.type = options.type ? options.type : 0;
	utility.checkUser(user!, options.type)
		.then((userID) => {
			API.getUser(userID, options.mode, options.type, options.relax)
				.then((res) => {
					generateUser(msg, options, res);
				}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });
		}).catch((err: Error) => {
			if (err.message == 'No user with the specified username/user id was found') {
				msg.channel.send(`:red_circle: **The username \`${user}\` is not valid**\nThe username used or linked does not exist on the \`${score.getServer(String(options.type))}\` servers. Try using the id of the user instead of the username`);
			} else {
				error.sendUnexpectedError(err, msg);
			}
		});
}

async function generateUser(msg: Message, options: IOptions, body: Array<IAPIUser>) {
	var mainColour = '#ffffff';
	var canvas = createCanvas(1200, 624);
	var ctx = canvas.getContext('2d');


	ctx.beginPath();
	ctx.fillStyle = '#303F76';
	format.rect(ctx, 0, 0, canvas.width, canvas.height, 45);
	ctx.fill();

	let backgroundImage = await loadImage(path.resolve(__dirname, '../assets/background.png'));
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

	if (options.type == 1) {
		userPictureUrl = `https://a.gatari.pw/${body[0].user_id}?${Date.now().toString()}`;
	} else if (options.type == 2) {
		userPictureUrl = `https://a.akatsuki.pw/${body[0].user_id}?${Date.now().toString()}`;
	}
	var userPicture;
	try {
		userPicture = await loadImage(userPictureUrl);
	} catch (err) {
		userPicture = await loadImage('https://osu.ppy.sh/images/layout/avatar-guest.png');
	}
	format.rect(ctx, 44, 55, 277, 277, 47);
	ctx.clip();

	var scale = Math.max(280 / userPicture.width, 280 / userPicture.height);
	var x = 170 + 14 - (userPicture.width / 2) * scale;
	var y = 170 + 25 - (userPicture.height / 2) * scale;
	ctx.drawImage(userPicture, x, y, userPicture.width * scale, userPicture.height * scale);
	ctx.restore();

	ctx.beginPath();
	ctx.ellipse(268 + 30, 277 + 30, 40, 40, 0, 0, Math.PI * 2);
	ctx.fill();

	var modes = ['osu', 'taiko', 'fruits', 'mania'];
	var icon = await loadImage(path.resolve(__dirname, `../assets/${modes[options.mode || 0]}.png`));
	ctx.drawImage(icon, 252, 261, 86, 86);


	ctx.fillStyle = mainColour;
	ctx.font = '63px VarelaRound';
	ctx.fillText(body[0].username, 347, 56 + 63);

	ctx.font = '40px VarelaRound';
	let country = countryCodes[body[0].country];
	var flag = await loadImage(`https://osu.ppy.sh/images/flags/${body[0].country}.png`);
	ctx.drawImage(flag, 350, 130, 60, 40);
	ctx.fillText(country, 420, 127 + 40);

	var gradeA = await loadImage(path.resolve(__dirname, '../assets/grade_a.png'));
	var gradeS = await loadImage(path.resolve(__dirname, '../assets/grade_s.png'));
	var gradeSS = await loadImage(path.resolve(__dirname, '../assets/grade_ss.png'));
	var gradeSH = await loadImage(path.resolve(__dirname, '../assets/grade_sh.png'));
	var gradeSSH = await loadImage(path.resolve(__dirname, '../assets/grade_ssh.png'));

	ctx.drawImage(gradeA, 766, 112 + 25, 98, 50);
	ctx.drawImage(gradeS, 922, 112 + 25, 98, 50);
	ctx.drawImage(gradeSH, 1080, 112 + 25, 98, 50);
	ctx.drawImage(gradeSS, 847, 221 + 25, 98, 50);
	ctx.drawImage(gradeSSH, 1002, 221 + 25, 98, 50);

	ctx.font = '28px VarelaRound';
	ctx.textAlign = 'center';
	ctx.fillText(format.number(parseInt(body[0].count_rank_a) || 0), 792 + 22, 171 + 25 + 28);
	ctx.fillText(format.number(parseInt(body[0].count_rank_s) || 0), 955 + 16, 171 + 25 + 28);
	ctx.fillText(format.number(parseInt(body[0].count_rank_sh) || 0), 1108 + 22, 171 + 25 + 28);
	ctx.fillText(format.number(parseInt(body[0].count_rank_ss) || 0), 888 + 9, 279 + 25 + 28);
	ctx.fillText(format.number(parseInt(body[0].count_rank_ssh) || 0), 1038 + 13, 279 + 25 + 28);

	ctx.textAlign = 'left';
	ctx.font = '75px VarelaRound';
	ctx.fillText('#' + format.number(parseInt(body[0].pp_rank) || 0), 347, 170 + 75);

	ctx.font = '57px VarelaRound';
	ctx.fillText('#' + format.number(parseInt(body[0].pp_country_rank) || 0), 347, 259 + 57);

	var hexagon = await loadImage(path.resolve(__dirname, '../assets/hexagon.png'));
	ctx.drawImage(hexagon, 342, 332, 72, 77);

	const level = parseInt(body[0].level);
	
	ctx.textAlign = 'center';
	ctx.font = '33px VarelaRound';
	ctx.fillText(Math.floor(level || 0), 378, 332 + 50);

	format.rect(ctx, 441, 364, 504, 12, 7);
	ctx.fillStyle = '#FFCC22';
	format.rect(ctx, 441, 364, 504 * (level - Math.floor(level) > 0.02 ? level - Math.floor(level) : 0.02), 12, 7);
	ctx.textAlign = 'left';
	ctx.fillStyle = mainColour;
	ctx.font = '21px VarelaRound';
	ctx.fillText(Math.floor(100 * (level - Math.floor(level)) || 0) + '%', 960, 359 + 21);

	ctx.fillStyle = mainColour + '21';
	format.rect(ctx, 44, 472, 191, 53, 30);
	format.rect(ctx, 278, 472, 232, 53, 30);
	format.rect(ctx, 547, 472, 306, 53, 30);
	format.rect(ctx, 897, 472, 250, 53, 30);


	ctx.fillStyle = mainColour;
	ctx.textAlign = 'center';
	ctx.font = '30px VarelaRound';
	ctx.fillText('pp', 118 + 20, 476 + 30);
	ctx.fillText('Accuracy', 314 + 80, 478 + 30);
	ctx.fillText('Hours Played', 592 + 110, 476 + 30);
	ctx.fillText('Score', 973 + 50, 478 + 30);

	ctx.font = '40px VarelaRound';
	ctx.fillText((format.number(Math.floor(parseFloat(body[0].pp_raw) || 0))), 82 + 60, 534 + 40);
	ctx.fillText(((Math.round((parseFloat(body[0].accuracy) || 0) * 100) / 100)) + '%', 324 + 75, 537 + 40);
	ctx.fillText(format.number(Math.floor((parseFloat(body[0].total_seconds_played) || 0) / 60 / 60)) + 'h', 651 + 50, 536 + 40);
	// ctx.fillText(format.number(Math.floor(parseInt(body[0].total_seconds_played) || 0) / 60 / 60) + 'h', 651 + 50, 536 + 40);
	ctx.fillText(format.numberSuffix(parseInt(body[0].total_score) || 0), 930 + 100, 536 + 40);

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'user_stats.png');
	msg.channel.send(attachment);
	console.log(`GENERATED USER CARD : ${msg.author.id} : https://osu.ppy.sh/users/${body[0].user_id} : ${Date.now() - time}ms`);
}


module.exports = {
	name: 'osu',
	description: 'Generates a user stats image',
	group: 'osu',
	options: argument.getArgumentDetails(['type']),
	arguments: argument.getOtherArgumentDetails(['Username']),
	example: 'https://i.imgur.com/QBYuhAJ.png',
	execute: execute,
	requestData: requestData,
	generateUser: generateUser
};