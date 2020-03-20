/* eslint-disable no-useless-escape */
const request = require('request');
const error = require('../handlers/error');
const Canvas = require('canvas');
const colours = require('../handlers/colours');
const fs = require('fs');
const path = require('path');
const format = require('../handlers/format');
const Discord = require('discord.js');

Canvas.registerFont('assets/Rubik-Bold.ttf', {
	family: 'rubik-bold'
});

Canvas.registerFont('assets/Rubik-Medium.ttf', {
	family: 'rubik'
});

function search(msg, args) {
	if (args.length != 0) {
		var name = args.join(' ');
	} else {
		console.log('SEARCH NONE');
		return;
	}

	request({
		url: `https://osu.ppy.sh/beatmapsets/search?q=${name}`,
		headers: {
			cookie: process.env.cookie
		},
		json: true
	}, (err, res, body) => {
		if (body.length == 0) {
			error.log(msg, 4042);
			return;
		}
		var highestDiff = 0;
		var highestDiffIndex = 0;
		for (var i = 0; i < body.beatmapsets[0].beatmaps.length; i++) {
			if (highestDiff < body.beatmapsets[0].beatmaps[i].difficulty_rating) {
				highestDiff = body.beatmapsets[0].beatmaps[i].difficulty_rating;
				highestDiffIndex = i;
			}
		}
		body.beatmapsets[0].beatmap = body.beatmapsets[0].beatmaps[highestDiffIndex];

		const embed = {
			'author': {
				'name': `${ body.beatmapsets[0].artist} - ${body.beatmapsets[0].title} by ${ body.beatmapsets[0].creator} [Download]`,
				'url': `https://osu.ppy.sh/beatmapsets/${body.beatmapsets[0].id}#osu/${body.beatmapsets[0].beatmaps[highestDiffIndex].id}`
			},
			'color': 2065919
		};
		msg.channel.send({
			embed
		});
		console.log(`SEARCH : ${msg.author.id} : https://osu.ppy.sh/beatmapsets/${body.beatmapsets[0].id}#osu/${body.beatmapsets[0].beatmaps[highestDiffIndex].id}`);
		request(`https://osu.ppy.sh/api/get_beatmaps?b=${body.beatmapsets[0].beatmaps[highestDiffIndex].id}&k=${process.env.osuAPI}`, {
			json: true
		}, (err, res, beatmapBody) => {
			body.beatmapsets[0].beatmaps[highestDiffIndex].max_combo = beatmapBody[0].max_combo;
			generateBeatmap(msg, body.beatmapsets[0]);
		});
	});
}


function generateBeatmap(msg, data) {

	// init the canvas
	var canvas = Canvas.createCanvas(1080, 620);
	var ctx = canvas.getContext('2d');
	let url = 'https://assets.ppy.sh/beatmaps/' + data.id + '/covers/cover@2x.jpg';
	colours.getColours(url, async function (colour) {
		colour = colours.toReadable(colours.toRGB(colour.foreground), colours.toRGB(colour.background));
		colour.foreground = colours.toHex(colour.foreground);
		colour.background = colours.toHex(colour.background);
		ctx.fillStyle = colour.background;
		format.rect(ctx,0,0,canvas.width, canvas.height, 37)

		// Beatmap Image
		try {
			var beatmapImage = await Canvas.loadImage(url);
		} catch (err) { 
			var beatmapImage = await Canvas.loadImage('https://osu.ppy.sh/images/layout/beatmaps/default-bg@2x.png');
		}

		ctx.shadowColor = 'rgba(0,0,0,0.8)';
		ctx.shadowBlur = 20;
		ctx.save();
		format.rect(ctx, 0, 0, canvas.width, 300, 37);
		ctx.clip();
		ctx.drawImage(beatmapImage, 0, 0, canvas.width, 300);
		ctx.restore();
		ctx.shadowBlur = 0;

		ctx.beginPath();
		ctx.fillStyle = '#3333338C';
		format.rect(ctx, 24, 20, 186, 46, 26);
		ctx.fillStyle = colour.foreground;
		format.rect(ctx, 24, 20, 46, 46, 26);
		ctx.font = '20px rubik';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(data.status.slice(0,1).toUpperCase() + data.status.slice(1).toLowerCase(), 127, 51);
		ctx.textAlign = 'center';
		var statusImage = await Canvas.loadImage(path.resolve(__dirname, '../assets/'+data.status+'.png'));
		ctx.drawImage(statusImage, 37, 33, 20, 20)

		// title
		ctx.fillStyle = colour.foreground;
		ctx.font = '42px rubik-bold';
		ctx.textAlign = 'left';
		ctx.fillText(data.title, 41, 367)
		ctx.font = '26px rubik-bold';
		ctx.fillText(data.artist, 41, 406)
		
		// star rating
		var svgFile = fs.readFileSync('assets/star.svg', 'utf8');
		svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${colour.foreground}"`);
		const star = await Canvas.loadImage(Buffer.from(svgFile));
		if (data.beatmap.difficulty_rating > 10) {
			for (var i = 0; i < 10; i++) {
				ctx.drawImage(star, 40 + 33 * i, 420, 28, 27);
			}
		} else {
			for (i = 0; i < Math.floor(data.beatmap.difficulty_rating); i++) {
				ctx.drawImage(star, 40 + 33 * i, 420, 28, 27);
			}
			var lastStarSize = (data.beatmap.difficulty_rating - Math.floor(data.beatmap.difficulty_rating))
			var minSize = 0.5
			var multiplier = ((1 - minSize) + (minSize * lastStarSize))
			ctx.drawImage(star, 40 + 33 * (i) + ((28 - (28 * multiplier))/2), 420 + ((27 - (27 * multiplier))/2), 28 * multiplier, 27 * multiplier)
		}

		//CS / AR /HP / OD

		ctx.fillStyle = colour.foreground;
		ctx.font = '22px rubik-bold';
		ctx.fillText('CS', 41, 459 + 22);
		ctx.fillText('AR', 41, 495 + 22);
		ctx.fillText('HP', 41, 531 + 22);
		ctx.fillText('OD', 41, 567 + 22);
		ctx.fillText(Math.floor(data.beatmap.difficulty_rating * 10) / 10, 390, 423 + 22);
		ctx.fillText(data.beatmap.cs, 390, 459 + 22);
		ctx.fillText(data.beatmap.ar, 390, 495 + 22);
		ctx.fillText(data.beatmap.drain, 390, 531 + 22);
		ctx.fillText(data.beatmap.accuracy, 390, 567 + 22);

		ctx.beginPath();
		ctx.fillStyle = colour.foreground + '31';
		format.rect(ctx, 88, 466, 284, 13, 7);
		format.rect(ctx, 88, 504, 284, 13, 7);
		format.rect(ctx, 88, 539, 284, 13, 7);
		format.rect(ctx, 88, 570, 284, 13, 7);
		ctx.beginPath();
		ctx.fillStyle = colour.foreground;
		format.rect(ctx, 88, 466, 28.4 * (data.beatmap.cs > 0 ? data.beatmap.cs : 0.5), 13, 7);
		format.rect(ctx, 88, 504, 28.4 * (data.beatmap.ar > 0 ? data.beatmap.ar : 0.5), 13, 7);
		format.rect(ctx, 88, 539, 28.4 * (data.beatmap.drain > 0 ? data.beatmap.drain : 0.5), 13, 7);
		format.rect(ctx, 88, 570, 28.4 * (data.beatmap.accuracy > 0 ? data.beatmap.accuracy : 0.5), 13, 7);

		const mapperPfp = await Canvas.loadImage(`https://a.ppy.sh/${data.user_id}`);
		ctx.save();
		format.rect(ctx, 478, 456, 91, 91, 16);
		ctx.clip();
		ctx.drawImage(mapperPfp, 478, 456, 91, 91);
		ctx.restore();
		
		ctx.font = '21px rubik-bold';
		ctx.textAlign = 'center';
		ctx.fillText(data.creator, 523, 581)

		svgFile = fs.readFileSync(path.resolve(__dirname, '../assets/clock.svg'), 'utf8');
		svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${colour.foreground}"`);
		let clock = await Canvas.loadImage(Buffer.from(svgFile));

		ctx.drawImage(clock, 481, 375, 38, 38);

		svgFile = fs.readFileSync(path.resolve(__dirname, '../assets/drum.svg'), 'utf8');
		svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${colour.foreground}"`);
		let drum = await Canvas.loadImage(Buffer.from(svgFile));

		ctx.drawImage(drum, 660, 375, 40, 35);

		svgFile = fs.readFileSync(path.resolve(__dirname, '../assets/times.svg'), 'utf8');
		svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${colour.foreground}"`);
		let times = await Canvas.loadImage(Buffer.from(svgFile));

		ctx.drawImage(times, 892, 380, 28, 28);

		var time = Math.floor(data.beatmap.total_length / 60) + ':' + (data.beatmap.total_length % 60 < 10 ? '0' + (data.beatmap.total_length % 60) : data.beatmap.total_length % 60);
		ctx.textAlign = 'left';
		ctx.font = '27px rubik-bold';
		ctx.fillText(time, 532, 374 + 30);
		ctx.fillText(data.bpm + ' bpm', 712, 374 + 30);
		ctx.fillText((data.beatmap.max_combo ? data.beatmap.max_combo : '-') + 'x', 937, 374 + 30);

		ctx.textAlign = 'left';
		ctx.font = '26px rubik-bold';
		ctx.fillText(data.beatmap.version, 629, 416 + 26);
		var compare = (a, b) => {
			if (parseFloat(a.difficulty_rating) > parseFloat(b.difficulty_rating)) {
				return 1
			} else {
				return -1
			}
		}
		data.beatmaps.sort(compare);

		for (i = 0; i < data.beatmaps.length; i++) {
			ctx.globalAlpha = 0.3;
			if (data.beatmaps[i].difficulty_rating == data.beatmap.difficulty_rating) {
				ctx.globalAlpha = 1;
				ctx.beginPath();
				ctx.fillStyle = colour.foreground + '21';
				format.rect(ctx, 630 + ((i % 8) * 50) - 5, 457 + (Math.floor(i / 8) * 50) - 5, 50, 50, 11);
				ctx.fill();
			}
			var icon;
			if (data.beatmaps[i].difficulty_rating < 2) {
				icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/easy_${data.beatmaps[i].mode}.png`));
			} else if (data.beatmaps[i].difficulty_rating < 2.7) {
				icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/normal_${data.beatmaps[i].mode}.png`));
			} else if (data.beatmaps[i].difficulty_rating < 4) {
				icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/hard_${data.beatmaps[i].mode}.png`));
			} else if (data.beatmaps[i].difficulty_rating < 5.3) {
				icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/insane_${data.beatmaps[i].mode}.png`));
			} else if (data.beatmaps[i].difficulty_rating < 6.5) {
				icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/expert_${data.beatmaps[i].mode}.png`));
			} else {
				icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/extra_${data.beatmaps[i].mode}.png`));
			}
			ctx.drawImage(icon, 630 + ((i % 8) * 50), 457 + (Math.floor(i / 8) * 50), 40, 40);
		}

		const attachment = new Discord.Attachment(canvas.toBuffer(), 'beatmap_stats.png');
		msg.channel.send(attachment);
		console.log(`GENERATED BEATMAP CARD : ${msg.author.id} : https://osu.ppy.sh/beatmapsets/${data.id}#osu/${data.beatmap.id}`);
	});
}




module.exports = {
	search: search,
	generateBeatmap: generateBeatmap
};