// Prettier ruined my code ;-;. I hate prettier. Never going to use it again
require('dotenv').config();
const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');
const client = new Discord.Client();
const languageCodes = JSON.parse(fs.readFileSync('language_codes.json'));
const countryCodes = JSON.parse(fs.readFileSync('country_codes.json'));
const Canvas = require('canvas');
// const { Beatmap, Osu: { DifficultyCalculator, PerformanceCalculator } } = require('pp-calculator')
Canvas.registerFont('assets/SegoeUI.ttf', { family: 'segoeUI' });
Canvas.registerFont('assets/SegoeUIBold.ttf', { family: 'segoeUIBold' });

// calculatepp(0, 95, 476, 0, '1194237');

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
    } else if (msg.content.includes('osu.ppy.sh/beatmapsets')) {
        var beatmapsetid = msg.content.match(/osu.ppy.sh\S+/g)[0];
        beatmapsetid = beatmapsetid.replace('osu.ppy.sh/beatmapsets/', '');
        var beatmapid = beatmapsetid.match(/#\S+/g)[0];
        beatmapid = beatmapid.replace('#osu/', '');
        beatmapsetid = beatmapsetid.replace(beatmapsetid.match(/#\S+/g), '');
        console.log(beatmapsetid);
        getBeatmapData(msg, beatmapsetid, beatmapid);
    } else if (msg.content.includes('osu.ppy.sh/users')) {
        var userid = msg.content.replace('https://osu.ppy.sh/users/', '');

        console.log(userid);
        createUserCard(msg, userid);
    }
});

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
	data.url = `https://osu.ppy.sh/beatmapsets/${beatmapsetid}#osu/${beatmapid}`
	// msg.channel.send(`${data.approved ? 'RANKED' : 'UNRANKED'}\n${data.title}\nStars: ${data.difficultyrating}\nCS: ${data.diff_size}OD: ${data.diff_overall}AR: ${data.diff_approach}HP: ${data.diff_drain}\nBPM: ${data.bpm}`);

	createBeatmapCard(msg, data);
	});
}

async function createBeatmapCard(msg, data) {
	// init the canvas
	var canvas = Canvas.createCanvas(1251, 685);
	var ctx = canvas.getContext('2d');
  // Background
	ctx.beginPath();
	ctx.fillStyle = '#121212';
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();
	// Beatmap Image
	console.log(`https://assets.ppy.sh/beatmaps/${data.beatmapset_id}/covers/cover@2x.jpg`);
	try {
	const beatmapImage = await Canvas.loadImage(`https://assets.ppy.sh/beatmaps/${data.beatmapset_id}/covers/cover@2x.jpg`);
	ctx.drawImage(beatmapImage, 0, 0, canvas.width, 346);
	} catch (err) { //change background to gradient if image is not found
		console.log(err);
		ctx.beginPath();
		var gradient = ctx.createLinearGradient(0,0, 0, 346);
		gradient.addColorStop(0, '#2B2B2C');
		gradient.addColorStop(1, '#1D1F21');
		ctx.fillStyle = gradient;
		ctx.rect(0, 0, canvas.width, 346);
		ctx.fill();
	}

	//title and artist name
	ctx.fillStyle = '#ffffff';
	ctx.font = '50px segoeUIBold';
	data.title = data.title.length <= 23 ? data.title : data.title.slice(0,22) + '...';
	ctx.fillText(data.title, 30, 406);
	ctx.font = '25px segoeUI';
	ctx.fillText(data.artist, 30, 446);
	
	// star rating
	const star = await Canvas.loadImage('assets/star.png');
	for (var i = 0; i < Math.floor(data.difficultyrating); i++) {
	ctx.drawImage(star, 30 + 40 * i, 460, 40, 40);
	}
	
	var lastStarSize = 40 * (data.difficultyrating - Math.floor(data.difficultyrating))
	ctx.drawImage(star, 30 + 40 * Math.floor(data.difficultyrating + 1) + ((40 - lastStarSize)/2), 460  + ((40 - lastStarSize)/2), lastStarSize,lastStarSize)

	//CS / AR /HP / OD
	
	ctx.fillStyle = '#ffffff';
	ctx.fillText('CS', 30, 540);
	ctx.fillText('AR', 30, 580);
	ctx.fillText('HP', 30, 620);
	ctx.fillText('OD', 30, 660);
	ctx.fillText(data.diff_size, 385, 540);
	ctx.fillText(data.diff_approach, 385, 580);
	ctx.fillText(data.diff_drain, 385, 620);
	ctx.fillText(data.diff_overall, 385, 660);

	ctx.beginPath();
	ctx.fillStyle = '#343434';
	for (var i = 0; i < 4; i++) {
	ctx.rect(70, 540 + 40 * i - 15, 300, 13);
	}
	ctx.fill();
	ctx.beginPath();
	ctx.fillStyle = '#ffffff';
	ctx.rect(70, 540 - 15, 300 / 8 * (data.diff_size - 2), 13);
	ctx.rect(70, 580 - 15, 30 * data.diff_approach, 13);
	ctx.rect(70, 620 - 15, 30 * data.diff_drain, 13);
	ctx.rect(70, 660 - 15, 30 * data.diff_overall, 13);
	ctx.fill();

	// ctx.font = '42px segoeUI';
	// ctx.fillText('---pp', 1100, 420);
	// ctx.font = '17px segoeUI';
	// ctx.fillText('100% Full Combo', 1100, 450);

	// ctx.font = '42px segoeUI';
	// ctx.fillText('---pp', 1100, 520);
	// ctx.font = '17px segoeUI';
	// ctx.fillText('95% Full Combo', 1100, 550);

	// ctx.font = '42px segoeUI';
	// ctx.fillText('---pp', 1100, 620);
	// ctx.font = '17px segoeUI';
	// ctx.fillText('90% Full Combo', 1100, 650);

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
		roundRect(ctx,630 + ((i % 7) * 83) - 5,390 + (Math.floor(i / 7)* 83)-5 ,81,81,5);
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
	ctx.drawImage(icon,630 + ((i % 7) * 83),390 + (Math.floor(i / 7) * 83),71,71);
	}

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'beatmap_stats.png');
	const embed = {
		'title': `${data.title} - ${data.artist} [Download]`,
		'url': data.url,
		'color': 2065919
		};
		msg.channel.send({embed});
		msg.channel.send(attachment);
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

function roundedImage(ctx,x,y,width,height,radius){
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
  }


function createUserCard(msg,id) {
	request(`https://osu.ppy.sh/api/get_user?k=${process.env.osuAPI}&u=${id}`, {
		json: true
	}, async (err, res, body) => {
		console.log(body);
		// init the canvas
		var canvas = Canvas.createCanvas(1080, 538);
		var ctx = canvas.getContext('2d');

		ctx.beginPath();
		ctx.fillStyle = '#121212';
		ctx.rect(0,0,canvas.width,canvas.height);
		ctx.fill();
		// background
		var background = await Canvas.loadImage(`./assets/background-${Math.round(Math.random() * 8) - 1}.png`);
		ctx.drawImage(background,0,0,canvas.width,300);
		ctx.save();
		try {
		var userPicture = await Canvas.loadImage(`https://a.ppy.sh/${body[0].user_id}`);
		} catch (err) {
		var userPicture = await Canvas.loadImage('https://osu.ppy.sh/images/layout/avatar-guest.png');
		}
		roundedImage(ctx,30,30,280,280,47);
		ctx.clip();
		ctx.drawImage(userPicture,30,30,280,280);
		ctx.restore();
	
		ctx.fillStyle = '#ffffff';
		ctx.font = '51px segoeUIBold';
		ctx.fillText(body[0].username,330,95);

		ctx.font = '40px segoeUI';
		let country = countryCodes[body[0].country];
		console.log(countryCodes);
		ctx.fillText(country,330,140);

		var gradeA = await Canvas.loadImage('assets/grade_a.png');
		var gradeS = await Canvas.loadImage('assets/grade_s.png');
		var gradeSS = await Canvas.loadImage('assets/grade_ss.png');
		var gradeSH = await Canvas.loadImage('assets/grade_sh.png');
		var gradeSSH = await Canvas.loadImage('assets/grade_ssh.png');

		ctx.drawImage(gradeSSH,370,180,95,48);
		ctx.drawImage(gradeSS,500,180,95,48);
		ctx.drawImage(gradeSH,630,180,95,48);
		ctx.drawImage(gradeS,760,180,95,48);
		ctx.drawImage(gradeA,890,180,95,48);

		ctx.font = '25px segoeUIBold';
		ctx.textAlign = 'center';
		ctx.fillText(body[0].count_rank_ssh,417,260,95,48);
		ctx.fillText(body[0].count_rank_ss,549,260,95,48);
		ctx.fillText(body[0].count_rank_sh,679,260,95,48);
		ctx.fillText(body[0].count_rank_s,809,260,95,48);
		ctx.fillText(body[0].count_rank_a,939,260,95,48);
		ctx.textAlign = 'left';
		ctx.font = '37px segoeUIBold';
		ctx.fillText('Global Rank',50,350);
		ctx.font = '65px segoeUI';
		ctx.fillText('#'+body[0].pp_rank,50,420);

		ctx.font = '20px segoeUIBold';
		ctx.fillText('Country Rank',50,450);
		ctx.font = '42px segoeUI';
		ctx.fillText('#'+body[0].pp_country_rank,50,500);

		var hexagon = await Canvas.loadImage('./assets/hexagon.png');
		ctx.drawImage(hexagon,340,271,70,76);

		ctx.textAlign = 'center';
		ctx.font = '33px segoeUI';
		ctx.fillText(Math.floor(body[0].level),375,320)
		
		roundRect(ctx,440,305,462,11,7);
		ctx.fillStyle = '#FFCC22';
		roundRect(ctx,440,305,462*(body[0].level - Math.floor(body[0].level)),11,7);
		ctx.textAlign = 'left';
		ctx.fillStyle = '#ffffff';
		ctx.font = '21px segoeUI';
		ctx.fillText(Math.floor(100*(body[0].level - Math.floor(body[0].level)))+'%',920,317)

		ctx.beginPath();
		ctx.fillStyle = '#242424';
		roundRect(ctx, 350,380,150,115,4);
		roundRect(ctx, 580,380,150,115,4);
		roundRect(ctx, 800,380,220,115,4);
		ctx.fill();

		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.font = '30px segoeUIBold';
		ctx.fillText('pp',425,418);
		ctx.fillText('Accuracy',655,418);
		ctx.fillText('hours played',905,418);
		ctx.font = '30px segoeUI';
		ctx.fillText(Math.floor(body[0].pp_raw),425,468)
		ctx.fillText(Math.floor(body[0].accuracy*100)/100+'%',655,468);
		ctx.fillText(Math.floor(body[0].total_seconds_played/60/60)+'h',905,468);

		const attachment = new Discord.Attachment(canvas.toBuffer(), 'user_stats.png');
		msg.channel.send('here',attachment);
		
	});

}
console.log(process.env.discordAPI);
client.login(process.env.discordAPI);


// function calculatepp(mods,acc,combo,misses,mapid) {
// 	request(`https://osu.ppy.sh/osu/${mapid}`,{json:true}, (err,res,body) => {
// 		let beatmap = Beatmap.fromOsu(body)
// 		let score = {
// 		  maxcombo: combo,
// 		  count50: 0,
// 		  count100: 0,
// 		  count300: combo,
// 		  countMiss: misses
// 		}
// 		let diffCalc = DifficultyCalculator.use(beatmap).setMods(score.mods).calculate()
// 		let perfCalc = PerformanceCalculator.use(diffCalc).calculate(score)
// 		console.log(perfCalc.totalPerformance)
// 	  });

// }-