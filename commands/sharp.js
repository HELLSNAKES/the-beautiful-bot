const sharp = require('sharp');
const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');
const request = require('request')
var time = Date.now();
var data = {
	id: 625749,
	title: 'Summer Boy'
}
var colours = require('../handlers/colours')

function send(msg) {
	var beatmapSVG = fs.readFileSync(path.resolve(__dirname, '../assets/beatmap.svg'), {
		encoding: 'utf-8'
	});
	var url = `https://assets.ppy.sh/beatmaps/${data.id}/covers/cover@2x.jpg`;
	request(url).pipe(fs.createWriteStream('./assets/cover.jpg')).on('finish', () => {
		var image = fs.readFileSync('./assets/cover.jpg');

		colours.getColours(url, async function (coloursExtracted) {
			coloursExtracted = colours.toReadable(colours.toRGB(coloursExtracted.foreground), colours.toRGB(coloursExtracted.background));
			coloursExtracted.foreground = colours.toHex(coloursExtracted.foreground);
			coloursExtracted.background = colours.toHex(coloursExtracted.background);
			console.log(coloursExtracted);
			beatmapSVG = beatmapSVG.replace('Beatmap Name', data.title.replace(/&/gi, '&amp;'))
			beatmapSVG = beatmapSVG.replace('<rect id="background" width="1285" height="723" rx="41" transform="translate(318 179)" fill="#33343b"/>' ,`<rect id="background" width="1285" height="723" rx="41" transform="translate(318 179)" fill="${coloursExtracted.background}"/>`)
			beatmapSVG = beatmapSVG.replace('<text id="map-title" transform="translate(366.908 604.7)" fill="#fd7735" stroke="#fd7735" stroke-width="1" font-size="51" font-family="Rubik-Medium, Rubik" font-weight="500"><tspan x="0" y="0">Beatmap Name</tspan>',`<text id="map-title" transform="translate(366.908 604.7)" fill="${coloursExtracted.foreground}" stroke="${coloursExtracted.foreground}" stroke-width="1" font-size="51" font-family="Rubik-Medium, Rubik" font-weight="500"><tspan x="0" y="0">${data.title}</tspan>`)
			fs.writeFileSync(path.resolve(__dirname, '../assets/generatedBeatmap.svg'),beatmapSVG);
			beatmapSVG = beatmapSVG.replace('image-url', 'data:image/jpeg;base64,' + Buffer.from(image).toString('base64'))
			sharp(Buffer.from(beatmapSVG)).resize(720).png().toBuffer().then((data) => {
				const attachment = new Discord.Attachment(data, 'user_stats.png');
				msg.channel.send(attachment)
			})
		});
	})


}

module.exports.send = send;