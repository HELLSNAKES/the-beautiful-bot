/* eslint-disable no-useless-escape */
import { Message, Client } from 'discord.js';

import * as error from '../handlers/error';
import * as colours from '../handlers/colours';
import * as format from '../handlers/format';
import * as argument from '../handlers/argument';
import * as beatmap from '../handlers/beatmap';
import * as API from '../handlers/API';
import * as database from '../handlers/database';
import * as getMap from '../handlers/getMap';
import * as parser from '../handlers/parser';

// const tbbpp = require('tbbpp');
const axios = require('axios');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');

Canvas.registerFont('assets/VarelaRound.ttf', {
	family: 'VarelaRound'
});

function execute(client : Client, msg: Message, args: Array<string>) {
	const getEmbed = () => {
		database.read('utility', {}, {})
			.then((docs) => {
				axios({
					url: `https://osu.ppy.sh/beatmapsets/search?q=${name}`,
					method: 'get',
					headers: {
						cookie: docs[0].cookie
					}
				}).then((res: any) => {
					if (res.data.beatmapsets.length == 0) {
						msg.channel.send(`:red_circle: No results found for the term \`${name}\``);
						return;
					}
					let highestDiff = 0;
					let highestDiffIndex = 0;
					for (let i = 0; i < res.data.beatmapsets[0].beatmaps.length; i++) {
						if (highestDiff < res.data.beatmapsets[0].beatmaps[i].difficulty_rating) {
							highestDiff = res.data.beatmapsets[0].beatmaps[i].difficulty_rating;
							highestDiffIndex = i;
						}
					}
					res.data.beatmapsets[0].beatmap = res.data.beatmapsets[0].beatmaps[highestDiffIndex];

					const embed = {
						'author': {
							'name': `${res.data.beatmapsets[0].artist} - ${res.data.beatmapsets[0].title} by ${res.data.beatmapsets[0].creator} [Download]`,
							'url': `https://osu.ppy.sh/beatmapsets/${res.data.beatmapsets[0].id}#osu/${res.data.beatmapsets[0].beatmaps[highestDiffIndex].id}`
						},
						'color': 2065919
					};

					msg.channel.send({
						embed
					});

					API.getBeatmap({
						beatmapID: res.data.beatmapsets[0].beatmaps[highestDiffIndex].id
					}).then((resBeatmap: any) => {
						res.data.beatmapsets[0].beatmaps[highestDiffIndex].max_combo = resBeatmap[0].max_combo;
						generateBeatmap(msg, res.data.beatmapsets[0]);
					});

					database.update('utility', { cookie: docs[0].cookie }, { cookie: res.headers['set-cookie'][2] }, { useCache: false })
						.catch(err => error.unexpectedError(err, 'While trying to set a new cookie'));

					console.log(`SEARCH : ${msg.author.id} : https://osu.ppy.sh/beatmapsets/${res.data.beatmapsets[0].id}#osu/${res.data.beatmapsets[0].beatmaps[highestDiffIndex].id}`);
				}).catch((err: Error) => error.sendUnexpectedError(err, msg));
			});
	};

	let name : any = args.join(' ');

	if (!name) {
		getMap.getMaps(client, msg, (client,msg, URLData) => {
			name = URLData.beatmapID;
		});
		
		getEmbed();
		return;
	}
	
	getEmbed();
}


function generateBeatmap(msg: Message, data: any) {
	if (data.beatmap.id == undefined) {
		error.log(msg, 4042);
		return;
	}
	// init the canvas
	let canvas = Canvas.createCanvas(1080, 620);
	let ctx = canvas.getContext('2d');
	let url = 'https://assets.ppy.sh/beatmaps/' + data.id + '/covers/cover@2x.jpg';
	axios.get(`https://osu.ppy.sh/osu/${data.beatmap.id}`)
		.then((res: any) => {
			var osuContent : any = parser.parseOsu(res.data);

			colours.getColours(url, async function (colour) {
				let colourNumber = colours.toReadable(colours.toRGB(colour.foreground), colours.toRGB(colour.background));
				colour.foreground = colours.toHex(colourNumber.foreground);
				colour.background = colours.toHex(colourNumber.background);
				ctx.fillStyle = colour.background;
				format.rect(ctx, 0, 0, canvas.width, canvas.height, 37);

				// Beatmap Image
				let beatmapImage;
				try {
					beatmapImage = await Canvas.loadImage(url);
				} catch (err) {
					beatmapImage = await Canvas.loadImage('https://osu.ppy.sh/images/layout/beatmaps/default-bg@2x.png').catch((err: any) => {
						error.unexpectedError(err, 'Message Content: '+ msg);
					});
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
				ctx.font = '20px VarelaRound';
				ctx.textAlign = 'center';
				ctx.fillStyle = '#ffffff';
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 1;
				ctx.fillText(data.status.slice(0, 1).toUpperCase() + data.status.slice(1).toLowerCase(), 127, 51);
				ctx.strokeText(data.status.slice(0, 1).toUpperCase() + data.status.slice(1).toLowerCase(), 127, 51);
				ctx.textAlign = 'center';
				let statusImage = await Canvas.loadImage(path.resolve(__dirname, '../assets/' + data.status + '.png')).catch((err: any) => {
					error.unexpectedError(err, 'Message Content: '+ msg);
				});
				ctx.drawImage(statusImage, 37, 33, 20, 20);

				// title
				ctx.fillStyle = colour.foreground;
				ctx.strokeStyle = colour.foreground;
				ctx.lineWidth = 2;
				ctx.font = '42px VarelaRound';
				ctx.textAlign = 'left';
				ctx.fillText(data.title, 41, 367);
				ctx.strokeText(data.title, 41, 367);
				ctx.font = '26px VarelaRound';
				ctx.lineWidth = 1;
				ctx.fillText(format.truncate(26, data.artist), 41, 406);
				ctx.strokeText(format.truncate(26, data.artist), 41, 406);

				// star rating
				let svgFile = fs.readFileSync('assets/star.svg', 'utf8');
				svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${colour.foreground}"`);
				const star = await Canvas.loadImage(Buffer.from(svgFile)).catch((err: any) => {
					error.unexpectedError(err, 'Message Content: '+ msg);
				});
				if (data.beatmap.difficulty_rating > 10) {
					for (let i = 0; i < 10; i++) {
						ctx.drawImage(star, 40 + 33 * i, 420, 28, 27);
					}
				} else {
					for (var i = 0; i < Math.floor(data.beatmap.difficulty_rating); i++) {
						ctx.drawImage(star, 40 + 33 * i, 420, 28, 27);
					}
					let lastStarSize = (data.beatmap.difficulty_rating - Math.floor(data.beatmap.difficulty_rating));
					let minSize = 0.5;
					let multiplier = ((1 - minSize) + (minSize * lastStarSize));
					ctx.drawImage(star, 40 + 33 * (i) + ((28 - (28 * multiplier)) / 2), 420 + ((27 - (27 * multiplier)) / 2), 28 * multiplier, 27 * multiplier);
				}

				//CS / AR /HP / OD

				ctx.fillStyle = colour.foreground;
				ctx.strokeStyle = colour.foreground;
				ctx.font = '22px VarelaRound';
				ctx.fillText('CS', 41, 459 + 22);
				ctx.strokeText('CS', 41, 459 + 22);
				ctx.fillText('AR', 41, 495 + 22);
				ctx.strokeText('AR', 41, 495 + 22);
				ctx.fillText('HP', 41, 531 + 22);
				ctx.strokeText('HP', 41, 531 + 22);
				ctx.fillText('OD', 41, 567 + 22);
				ctx.strokeText('OD', 41, 567 + 22);
				ctx.fillText(Math.round(data.beatmap.difficulty_rating * 10) / 10, 390, 423 + 22);
				ctx.strokeText(Math.round(data.beatmap.difficulty_rating * 10) / 10, 390, 423 + 22);
				ctx.fillText(data.beatmap.cs, 390, 459 + 22);
				ctx.strokeText(data.beatmap.cs, 390, 459 + 22);
				ctx.fillText(data.beatmap.ar, 390, 495 + 22);
				ctx.strokeText(data.beatmap.ar, 390, 495 + 22);
				ctx.fillText(data.beatmap.drain, 390, 531 + 22);
				ctx.strokeText(data.beatmap.drain, 390, 531 + 22);
				ctx.fillText(data.beatmap.accuracy, 390, 567 + 22);
				ctx.strokeText(data.beatmap.accuracy, 390, 567 + 22);

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

				try {
					var mapperPfp = await Canvas.loadImage(`https://a.ppy.sh/${data.user_id}`);
				} catch (err) {
					mapperPfp = await Canvas.loadImage('https://osu.ppy.sh/images/layout/avatar-guest.png').catch((err: any) => {
						error.unexpectedError(err, 'Message Content: '+ msg);
					});

				}
				ctx.save();
				format.rect(ctx, 478, 456, 91, 91, 16);
				ctx.clip();
				ctx.drawImage(mapperPfp, 478, 456, 91, 91);
				ctx.restore();

				ctx.font = '21px VarelaRound';
				ctx.textAlign = 'center';
				ctx.fillText(data.creator, 523, 581);
				ctx.strokeText(data.creator, 523, 581);


				svgFile = fs.readFileSync(path.resolve(__dirname, '../assets/clock.svg'), 'utf8');
				svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${colour.foreground}"`);
				let clock = await Canvas.loadImage(Buffer.from(svgFile)).catch((err: any) => {
					error.unexpectedError(err, 'Message Content: '+ msg);
				});

				ctx.drawImage(clock, 455, 375, 38, 38);

				svgFile = fs.readFileSync(path.resolve(__dirname, '../assets/times.svg'), 'utf8');
				svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${colour.foreground}"`);
				let times = await Canvas.loadImage(Buffer.from(svgFile)).catch((err: any) => {
					error.unexpectedError(err, 'Message Content: '+ msg);
				});

				ctx.drawImage(times, 600, 380, 28, 28);

				svgFile = fs.readFileSync(path.resolve(__dirname, '../assets/drum.svg'), 'utf8');
				svgFile = svgFile.replace(/fill="[#\.a-zA-Z0-9]+"/g, `fill="${colour.foreground}"`);
				let drum = await Canvas.loadImage(Buffer.from(svgFile)).catch((err: any) => {
					error.unexpectedError(err, 'Message Content: '+ msg);
				});

				ctx.drawImage(drum, 756, 375, 40, 35);

				var time = Math.floor(data.beatmap.total_length / 60) + ':' + (data.beatmap.total_length % 60 < 10 ? '0' + (data.beatmap.total_length % 60) : data.beatmap.total_length % 60);
				
				try {
					var bpm = beatmap.getVariableBPM(data.bpm, osuContent.bpmMin, osuContent.bpmMax, osuContent.timingPoints, data.beatmap.total_length) + ' bpm';
				} catch {
					bpm = data.bpm + ' bpm';
				}

				ctx.textAlign = 'left';
				ctx.font = '27px VarelaRound';
				ctx.fillText(time, 505, 374 + 30);
				ctx.strokeText(time, 505, 374 + 30);
				ctx.fillText((data.beatmap.max_combo ? data.beatmap.max_combo : '-') + 'x', 642, 374 + 30);
				ctx.strokeText((data.beatmap.max_combo ? data.beatmap.max_combo : '-') + 'x', 642, 374 + 30);
				ctx.fillText(bpm, 816, 374 + 30);
				ctx.strokeText(bpm, 816, 374 + 30);

				ctx.textAlign = 'left';
				ctx.font = '26px VarelaRound';
				ctx.fillText(data.beatmap.version, 629, 416 + 26);
				ctx.strokeText(data.beatmap.version, 629, 416 + 26);

				var compare = (a: any, b: any) => {
					if (parseFloat(a.difficulty_rating) > parseFloat(b.difficulty_rating)) {
						return 1;
					} else {
						return -1;
					}
				};
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
						icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/easy_${data.beatmaps[i].mode}.png`)).catch((err: any) => {
							error.unexpectedError(err, 'Message Content: '+ msg);
						});
					} else if (data.beatmaps[i].difficulty_rating < 2.7) {
						icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/normal_${data.beatmaps[i].mode}.png`)).catch((err: any) => {
							error.unexpectedError(err, 'Message Content: '+ msg);
						});
					} else if (data.beatmaps[i].difficulty_rating < 4) {
						icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/hard_${data.beatmaps[i].mode}.png`)).catch((err: any) => {
							error.unexpectedError(err, 'Message Content: '+ msg);
						});
					} else if (data.beatmaps[i].difficulty_rating < 5.3) {
						icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/insane_${data.beatmaps[i].mode}.png`)).catch((err: any) => {
							error.unexpectedError(err, 'Message Content: '+ msg);
						});
					} else if (data.beatmaps[i].difficulty_rating < 6.5) {
						icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/expert_${data.beatmaps[i].mode}.png`)).catch((err: any) => {
							error.unexpectedError(err, 'Message Content: '+ msg);
						});
					} else {
						icon = await Canvas.loadImage(path.resolve(__dirname, `../assets/extra_${data.beatmaps[i].mode}.png`)).catch((err: any) => {
							error.unexpectedError(err, 'Message Content: '+ msg);
						});
					}
					ctx.drawImage(icon, 630 + ((i % 8) * 50), 457 + (Math.floor(i / 8) * 50), 40, 40);
				}

				const attachment = new Discord.Attachment(canvas.toBuffer(), 'beatmap_stats.png');
				msg.channel.send(attachment);
				console.log(`GENERATED BEATMAP CARD : ${msg.author.id} : https://osu.ppy.sh/beatmapsets/${data.id}#osu/${data.beatmap.id}`);
			});
		}).catch((err : Error) => {error.sendUnexpectedError(err, msg);});

}





module.exports = {
	name: 'map',
	description: 'Searches for a map to generate a beatmap image for',
	group: 'osu',
	arguments: argument.getOtherArgumentDetails(['Term']),
	example: 'https://i.imgur.com/yEGz5D4.png',
	execute: execute,
	generateBeatmap: generateBeatmap
};