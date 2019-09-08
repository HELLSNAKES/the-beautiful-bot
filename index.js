// Prettier ruined my code ;-;. I hate prettier. Never going to use it again
require('dotenv').config();
const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');
const client = new Discord.Client();
const languageCodes = JSON.parse(fs.readFileSync('language_codes.json'));
const Canvas = require('canvas');
var canvas = Canvas.createCanvas(1251, 685);
var ctx = canvas.getContext('2d');
Canvas.registerFont('assets/SegoeUI.ttf', { family: 'segoeUI' });
Canvas.registerFont('assets/SegoeUIBold.ttf', { family: 'segoeUIBold' });

// getUserData('14392546')

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    msg.content = msg.content.toLowerCase();
    if (msg.content === 'bot you alive?') { // bot are you alive
        msg.reply('**YES!!!**');
    } else if (msg.content === 'cat') { // cat
        request('https://api.thecatapi.com/v1/images/search', function(err, res, body) {
            msg.reply(JSON.parse(body)[0].url);
        });
    } else if (msg.content.startsWith('translate')) { //translate
        var parameter = msg.content.replace('translate', '').trim();
        console.log(parameter);
        if (!parameter) {
            msg.channel.fetchMessages({ limit: 2 }).then(messages => {
                var lastMessage = messages.last();
                console.log(lastMessage);
                if (!lastMessage.author.bot) {
                    request(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${process.env.yandexAPI}&text=${encodeURIComponent(messages.last().content)}&lang=en`, function(err, res, body) {
                        body = JSON.parse(body);
                        var langFrom = body.lang.split('-')[0];
                        for (var i of languageCodes.languageCodes) {
                            if (i[0] == langFrom) {
                                langFrom = i[1];
                                break;
                            }
                        }
                        console.log(body.text[0]);
                        console.log(`Language Detected: **${langFrom}**`);
                        msg.reply(`Translation: **${body.text[0]}**\nLanguage Detected: ${langFrom}`);
                    });
                }
            });
        } else {
            parameter = parameter[0].toUpperCase() + parameter.slice(1).toLowerCase();
            for (var i of languageCodes.languageCodes) {
                if (i[1] == parameter) {
                    lang = `en-${i[0]}`;
                }
            }
            msg.channel.fetchMessages({ limit: 2 }).then(messages => {
                var lastMessage = messages.last();
                console.log(lastMessage);
                if (!lastMessage.author.bot) {
                    request(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${process.env.yandexAPI}&text=${encodeURIComponent(messages.last().content)}&lang=${lang}`, function(err, res, body) {
                        body = JSON.parse(body);
                        console.log(body.text[0]);
                        console.log(`Language Detected: **${parameter}**`);
                        msg.reply(`Translation: **${body.text[0]}**\nLanguage Detected: ${parameter}`);
                    });
                }
            });
        }
    } else if (msg.content.includes('bye')) {
        // bye
        msg.reply('See you next time ;). I hope you get the Joke.');
    } else if (msg.content === 'good bot') {
        msg.reply('<:heart:' + 615531857253105664 + '>');
        // console.log(emoji)
    } else if (msg.content.includes('osu.ppy.sh')) {
        var beatmapsetid = msg.content.match(/osu.ppy.sh\S+/g)[0];
        beatmapsetid = beatmapsetid.replace('osu.ppy.sh/beatmapsets/', '');
        var beatmapid = beatmapsetid.match(/#\S+/g)[0];
        beatmapid = beatmapid.replace('#osu/', '');
        beatmapsetid = beatmapsetid.replace(beatmapsetid.match(/#\S+/g), '');
        console.log(beatmapsetid);
        getBeatmapData(msg, beatmapsetid, beatmapid);
    }
});

function getUserData(id) {
    request(`https://osu.ppy.sh/api/get_user?k=${process.env.osuAPI}&u=${id}`, {
        json: true
    }, (err, res, body) => {
        console.log(body);
    });
}

function getBeatmapData(msg, beatmapsetid, beatmapid) {
    request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&s=${beatmapsetid}`, { json: true }, (err, res, body) => {
                console.log(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&s=${beatmapsetid}${beatmapid? '&b=' + beatmapid: 'z`'}&limit=1`);

	var data = body[0];
	var difficulties = [];
	for (var i of body) {
		difficulties.push(i.difficultyrating);
		console.log(i.difficultyrating)
		if (i.beatmap_id == beatmapid) {
		data = i;
	  }
	}
	data.difficulties = difficulties;
	console.log(data)
	msg.channel.send(`${data.approved ? 'RANKED' : 'UNRANKED'}\n${data.title}\nStars: ${data.difficultyrating}\nCS: ${data.diff_size}OD: ${data.diff_overall}AR: ${data.diff_approach}HP: ${data.diff_drain}\nBPM: ${data.bpm}`);

	createCard(msg, data);
	});
}

async function createCard(msg, data) {
  // Background
	ctx.beginPath();
	ctx.fillStyle = '#121212';
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();
	// Beatmap Image
	console.log(`https://assets.ppy.sh/beatmaps/${data.beatmapset_id}/covers/cover@2x.jpg`);
	const beatmapImage = await Canvas.loadImage(`https://assets.ppy.sh/beatmaps/${data.beatmapset_id}/covers/cover@2x.jpg`);
	ctx.drawImage(beatmapImage, 0, 0, canvas.width, 346);

	ctx.fillStyle = '#ffffff';
	ctx.font = '50px segoeUIBold';
	ctx.fillText(data.title, 30, 406);
	ctx.font = '25px segoeUI';
	ctx.fillText(data.artist, 30, 446);
	const star = await Canvas.loadImage('assets/star.png');
	for (var i = 0; i < Math.floor(data.difficultyrating); i++) {
	ctx.drawImage(star, 30 + 40 * i, 470, 40, 40);
	}
	
	var lastStarSize = 40 * (data.difficultyrating - Math.floor(data.difficultyrating))
	ctx.drawImage(star, 30 + 40 * Math.floor(data.difficultyrating + 1) + ((40 - lastStarSize)/2), 470  + ((40 - lastStarSize)/2), lastStarSize,lastStarSize)

	ctx.fillStyle = '#ffffff';
	ctx.fillText('CS', 30, 540);
	ctx.fillText('AR', 30, 570);
	ctx.fillText('HP', 30, 600);
	ctx.fillText('OD', 30, 630);
	ctx.fillText(data.diff_size, 385, 540);
	ctx.fillText(data.diff_approach, 385, 570);
	ctx.fillText(data.diff_drain, 385, 600);
	ctx.fillText(data.diff_overall, 385, 630);

	ctx.beginPath();
	ctx.fillStyle = '#343434';
	for (var i = 0; i < 4; i++) {
	ctx.rect(70, 540 + 30 * i - 15, 300, 13);
	}
	ctx.fill();
	ctx.beginPath();
	ctx.fillStyle = '#ffffff';
	ctx.rect(70, 540 - 15, 300 / 8 * (data.diff_size - 2), 13);
	ctx.rect(70, 570 - 15, 30 * data.diff_approach, 13);
	ctx.rect(70, 600 - 15, 30 * data.diff_drain, 13);
	ctx.rect(70, 630 - 15, 30 * data.diff_overall, 13);
	ctx.fill();

	ctx.font = '42px segoeUI';
	ctx.fillText('---pp', 1100, 420);
	ctx.font = '17px segoeUI';
	ctx.fillText('100% Full Combo', 1100, 450);

	ctx.font = '42px segoeUI';
	ctx.fillText('---pp', 1100, 520);
	ctx.font = '17px segoeUI';
	ctx.fillText('95% Full Combo', 1100, 550);

	ctx.font = '42px segoeUI';
	ctx.fillText('---pp', 1100, 620);
	ctx.font = '17px segoeUI';
	ctx.fillText('90% Full Combo', 1100, 650);

	const totalLength = await Canvas.loadImage('assets/total_length.png');
	const bpm = await Canvas.loadImage('assets/bpm.png');
	const totalCircles = await Canvas.loadImage('assets/count_circles.png');
	const totalSliders = await Canvas.loadImage('assets/count_sliders.png');

	ctx.drawImage(totalLength,450,430,50,50);
	ctx.drawImage(bpm,450,495,50,50);
	ctx.drawImage(totalCircles,450,560,50,50);
	ctx.drawImage(totalSliders,450,625,50,50);

	ctx.font = '25px segoeUI';
	var time =  Math.floor(data.total_length / 60) + ':' + (data.total_length % 60 < 10 ? '0' + (data.total_length % 60) : data.total_length % 60);

	ctx.fillText(time,510,465);
	ctx.fillText(data.bpm,510,530);
	ctx.fillText(data.count_normal,510,595);
	ctx.fillText(data.count_slider,510,660);
	data.difficulties.sort();
	for (var i = 0;i < data.difficulties.length;i++) {
	if (data.difficulties[i] == data.difficultyrating) {
		ctx.beginPath();
		ctx.fillStyle = '#ffffff21';
		roundRect(ctx,630 + ((i % 5) * 83) - 5,390 + (Math.floor(i / 5)* 83)-5 ,81,81,5);
		ctx.fill();
	}
	if (data.difficulties[i] < 2) {
		var icon = await Canvas.loadImage('assets/easy.png');
	} else if (data.difficulties[i] < 2.7) {
		var icon = await Canvas.loadImage('assets/normal.png');
	} else if (data.difficulties[i] < 4) {
		var icon = await Canvas.loadImage('assets/hard.png');
	} else if (data.difficulties[i] < 5.3) {
		var icon = await Canvas.loadImage('assets/insane.png');
	} else if (data.difficulties[i] < 6.5) {
		var icon = await Canvas.loadImage('assets/expert.png');
	} else {
		var icon = await Canvas.loadImage('assets/extra.png');
	}
	ctx.drawImage(icon,630 + ((i % 5) * 83),390 + (Math.floor(i / 5) * 83),71,71);
	}

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');
	msg.channel.send('Here', attachment);
}


function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == 'undefined') {
	  stroke = true;
	}
	if (typeof radius === 'undefined') {
	  radius = 5;
	}
	if (typeof radius === 'number') {
	  radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
	  var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
	  for (var side in defaultRadius) {
		radius[side] = radius[side] || defaultRadius[side];
	  }
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	ctx.fill();
  }



console.log(process.env.discordAPI);
client.login(process.env.discordAPI);