/* eslint-disable no-useless-escape */
const request = require('request');
const error = require('../handlers/error');
const Canvas = require('canvas');
const colours = require('../handlers/colours');
const fs = require('fs');
const {
	execSync
} = require('child_process');
const Discord = require('discord.js');
const format = require('../handlers/format');

Canvas.registerFont('assets/Rubik-Bold.ttf', {
	family: 'rubik'
});

function beatmapCardFromLink(msg) {
	var beatmapsetid = msg.content.match(/osu.ppy.sh\S+/g)[0];
	beatmapsetid = beatmapsetid.replace('osu.ppy.sh/beatmapsets/', '');
	var beatmapid = beatmapsetid.match(/#\S+/g)[0];
	beatmapid = beatmapid.replace('#osu/', '');
	beatmapsetid = beatmapsetid.replace(beatmapsetid.match(/#\S+/g), '');
	getBeatmapData(msg, beatmapsetid, beatmapid);
}

function getBeatmapData(msg, beatmapsetid, beatmapid) {
	request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&s=${beatmapsetid}`, {
		json: true
	}, (err, res, body) => {
		if (body.length == 0) {
			error.log(msg, 4042);
			return;
		}
		var data = body[0];
		var difficulties = [];
		for (var i of body) {
			difficulties.push(i.difficultyrating);
			if (i.beatmap_id == beatmapid) {
				data = i;
			}
		}
		data.difficulties = difficulties;
		data.url = 'https://osu.ppy.sh/beatmapsets/' + beatmapsetid + '#osu/' + beatmapid;
		console.log(`BEATMAP DATA : ${msg.author.id} : https://osu.ppy.sh/beatmapsets/${beatmapsetid}#osu/${beatmapid}`);

		if (msg) {
			createBeatmapCard(msg, data);
		} else {
			return (data);
		}

	});
}

async function createBeatmapCard(msg, data) {
	// init the canvas
	var canvas = Canvas.createCanvas(1380, 745);
	var ctx = canvas.getContext('2d');
	let url = 'https://assets.ppy.sh/beatmaps/' + data.beatmapset_id + '/covers/cover@2x.jpg';

	colours.getColours(url, async function (coloursExtracted) {
		coloursExtracted = colours.toReadable(colours.toRGB(coloursExtracted.foreground), colours.toRGB(coloursExtracted.background));
		coloursExtracted.foreground = colours.toHex(coloursExtracted.foreground);
		coloursExtracted.background = colours.toHex(coloursExtracted.background);
		// Beatmap Image
		try {
			const beatmapImage = await Canvas.loadImage(url);
			ctx.drawImage(beatmapImage, 0, 0, canvas.width, 382);
		} catch (err) { //change background to gradient if image is not found
			ctx.beginPath();
			var gradient = ctx.createLinearGradient(0, 0, 0, 346);
			gradient.addColorStop(0, '#2B2B2C');
			gradient.addColorStop(1, '#1D1F21');
			ctx.fillStyle = gradient;
			ctx.rect(0, 0, canvas.width, 382);
			ctx.fill();
		}
		// Background
		ctx.beginPath();
		ctx.fillStyle = coloursExtracted.background;
		ctx.rect(0, 382, canvas.width, canvas.height);
		ctx.fill();

		var grd = ctx.createLinearGradient(0, 64, 0, 382);
		grd.addColorStop(0, coloursExtracted.background + '00');
		grd.addColorStop(1, coloursExtracted.background);
		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, canvas.width, 382);
		ctx.fill();

		var approved;
		if (data.approved == -2) approved = 'graveyard';
		else if (data.approved == -1) approved = 'WIP';
		else if (data.approved == 0) approved = 'pending';
		else if (data.approved == 1) approved = 'ranked';
		else if (data.approved == 2) approved = 'approved';
		else if (data.approved == 3) approved = 'qualified';
		else if (data.approved == 4) approved = 'loved';

		ctx.fillStyle = coloursExtracted.background + 'DD';
		format.rect(ctx, 20, 20, 200, 50, 27);
		ctx.font = '25px rubik';
		ctx.textAlign = 'center';
		ctx.fillStyle = coloursExtracted.foreground;
		ctx.fillText(approved.toUpperCase(), 120, 54);
		ctx.textAlign = 'left';

		//title and artist name
		ctx.fillStyle = coloursExtracted.foreground;
		ctx.font = '54px rubik';
		data.title = data.title.length <= 23 ? data.title : data.title.slice(0, 20) + '...';
		ctx.fillText(data.title, 34, 380 + 64);
		ctx.font = '25px rubik';
		ctx.fillText(data.artist, 37, 451 + 29);

		// star rating
		var svgFile = fs.readFileSync('assets/star.svg', 'utf8');
		svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${coloursExtracted.foreground}"`);
		fs.writeFileSync('assets/star.svg', svgFile);
		const star = await Canvas.loadImage('assets/star.svg');
		if (data.difficultyrating > 10) {
			for (var i = 0; i < 9; i++) {

				ctx.drawImage(star, 30 + 40 * i, 505, 33, 32);
			}
		} else {
			for (i = 0; i < Math.floor(data.difficultyrating); i++) {
				ctx.drawImage(star, 30 + 40 * i, 505, 33, 32);
			}

			var lastStarSize = 32 * (data.difficultyrating - Math.floor(data.difficultyrating));
			ctx.drawImage(star, 30 + 40 * Math.floor(data.difficultyrating + 1) + ((33 - lastStarSize) / 2), 505 + ((32 - lastStarSize) / 2), lastStarSize, lastStarSize);
		}
		//CS / AR /HP / OD

		ctx.fillStyle = coloursExtracted.foreground;
		ctx.font = '32px rubik';
		ctx.fillText('CS', 37, 548 + 38);
		ctx.fillText('AR', 37, 584 + 38);
		ctx.fillText('HP', 37, 622 + 38);
		ctx.fillText('OD', 37, 660 + 38);
		ctx.font = '25px rubik';
		ctx.fillText(data.diff_size, 420, 548 + 38);
		ctx.fillText(data.diff_approach, 420, 584 + 38);
		ctx.fillText(data.diff_drain, 420, 622 + 38);
		ctx.fillText(data.diff_overall, 420, 660 + 38);
		ctx.fillText(Math.floor(data.difficultyrating * 10) / 10, 420, 495 + 38);

		ctx.beginPath();
		ctx.fillStyle = coloursExtracted.foreground + '31';
		format.rect(ctx, 100, 568 + 2, 300, 13, 7);
		format.rect(ctx, 100, 605 + 2, 300, 13, 7);
		format.rect(ctx, 100, 642 + 2, 300, 13, 7);
		format.rect(ctx, 100, 682 + 2, 300, 13, 7);
		ctx.beginPath();
		ctx.fillStyle = coloursExtracted.foreground;
		format.rect(ctx, 100, 568 + 2, 30 * (data.diff_size > 0 ? data.diff_size : 0.5), 13, 7);
		format.rect(ctx, 100, 605 + 2, 30 * (data.diff_approach > 0 ? data.diff_approach : 0.5), 13, 7);
		format.rect(ctx, 100, 642 + 2, 30 * (data.diff_drain > 0 ? data.diff_drain : 0.5), 13, 7);
		format.rect(ctx, 100, 682 + 2, 30 * (data.diff_overall > 0 ? data.diff_overall : 0.5), 13, 7);
		try {
			var Acc100 = Math.floor(parseInt(execSync(`curl -s https://osu.ppy.sh/osu/${data.beatmap_id} | node handlers/pp.js 100%`))).toString().split('$')[0];
			var Acc95 = Math.floor(parseInt(execSync(`curl -s https://osu.ppy.sh/osu/${data.beatmap_id} | node handlers/pp.js 95%`))).toString().split('$')[0];
			var Acc90 = Math.floor(parseInt(execSync(`curl -s https://osu.ppy.sh/osu/${data.beatmap_id} | node handlers/pp.js 90%`))).toString().split('$')[0];
		} catch (e) {
			Acc100 = '-';
			Acc95 = '-';
			Acc90 = '-';
		}

		ctx.textAlign = 'center';
		ctx.font = '42px rubik';
		ctx.fillText(`${Acc100}pp`, 1195 + 65, 460 + 10);
		ctx.font = '20px rubik';
		ctx.fillText('100% FC', 1195 + 65, 500 + 10);

		ctx.font = '42px rubik';
		ctx.fillText(`${Acc95}pp`, 1195 + 65, 550 + 10);
		ctx.font = '20px rubik';
		ctx.fillText('95% FC', 1195 + 65, 590 + 10);

		ctx.font = '42px rubik';
		ctx.fillText(`${Acc90}pp`, 1195 + 65, 640 + 10);
		ctx.font = '20px rubik';
		ctx.fillText('90% FC', 1195 + 65, 680 + 10);

		svgFile = fs.readFileSync('assets/clock.svg', 'utf8');
		svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${coloursExtracted.foreground}"`);
		fs.writeFileSync('assets/clock.svg', svgFile);
		let clock = await Canvas.loadImage('assets/clock.svg');

		ctx.drawImage(clock, 512, 510, 32, 32);

		svgFile = fs.readFileSync('assets/drum.svg', 'utf8');
		svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${coloursExtracted.foreground}"`);
		fs.writeFileSync('assets/drum.svg', svgFile);
		let drum = await Canvas.loadImage('assets/drum.svg');

		ctx.drawImage(drum, 504, 591, 36, 32);

		svgFile = fs.readFileSync('assets/times.svg', 'utf8');
		svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${coloursExtracted.foreground}"`);
		fs.writeFileSync('assets/times.svg', svgFile);
		let times = await Canvas.loadImage('assets/times.svg');

		ctx.drawImage(times, 512, 670, 26, 26);

		ctx.textAlign = 'left';
		ctx.font = '25px rubik';
		var time = Math.floor(data.total_length / 60) + ':' + (data.total_length % 60 < 10 ? '0' + (data.total_length % 60) : data.total_length % 60);

		ctx.fillText(time, 560, 534);
		ctx.fillText(data.bpm + ' bpm', 560, 618);
		ctx.fillText(data.max_combo + 'x', 560, 691);

		ctx.fillText(data.version, 695, 440);
		data.difficulties.sort();
		for (i = 0; i < data.difficulties.length; i++) {
			ctx.globalAlpha = 0.33;
			if (data.difficulties[i] == data.difficultyrating) {
				ctx.globalAlpha = 1;
				ctx.beginPath();
				ctx.fillStyle = coloursExtracted.foreground + '21';
				format.rect(ctx, 703 + ((i % 5) * 90) - 5, 457 + (Math.floor(i / 5) * 90) - 5, 87, 87, 10);
				ctx.fill();
			}
			var icon;
			var modes = ['', '_taiko', '_ctb', '_mania'];
			if (data.difficulties[i] < 2) {
				icon = await Canvas.loadImage(`assets/easy${modes[data.mode]}.png`);
			} else if (data.difficulties[i] < 2.7) {
				icon = await Canvas.loadImage(`assets/normal${modes[data.mode]}.png`);
			} else if (data.difficulties[i] < 4) {
				icon = await Canvas.loadImage(`assets/hard${modes[data.mode]}.png`);
			} else if (data.difficulties[i] < 5.3) {
				icon = await Canvas.loadImage(`assets/insane${modes[data.mode]}.png`);
			} else if (data.difficulties[i] < 6.5) {
				icon = await Canvas.loadImage(`assets/expert${modes[data.mode]}.png`);
			} else {
				icon = await Canvas.loadImage(`assets/extra${modes[data.mode]}.png`);
			}
			ctx.drawImage(icon, 703 + ((i % 5) * 90), 457 + (Math.floor(i / 5) * 90), 76, 76);
		}

		const attachment = new Discord.Attachment(canvas.toBuffer(), 'beatmap_stats.png');
		msg.channel.send(attachment);
		console.log(`GENERATED BEATMAP CARD : ${msg.author.id} :https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}#osu/${data.beatmap_id}`);
	});
}

module.exports = {
	beatmapCardFromLink: beatmapCardFromLink
};