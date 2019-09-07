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
    request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&s=${beatmapsetid}${beatmapid ? '&b=' + beatmapid: ''}`, { json: true }, (err, res, body) => {
                console.log(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&s=${beatmapsetid}${beatmapid? '&b=' + beatmapid: 'z`'}&limit=1`);
	var data = body[0];
	for (var i of body) {
		if (i.beatmap_id == beatmapid) {
		data = i;
		break;
	  }
	}
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
	ctx.drawImage(star, 30 + 40 * Math.floor(data.difficultyrating + 1), 470, 40, 40);
	ctx.fillStyle = '#121212';
	ctx.beginPath();
	ctx.rect(30 + 40 * Math.floor(data.difficultyrating + 1) - (1 - data.difficultyrating - Math.floor(data.difficultyrating + 1)), 470, 40, 40);
	ctx.fill();

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

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');
	msg.channel.send('Here', attachment);
}

console.log(process.env.discordAPI);
client.login(process.env.discordAPI);