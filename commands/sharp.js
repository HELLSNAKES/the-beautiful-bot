const sharp = require('sharp');
const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');
const request = require('request')
var time = Date.now();

function send(msg) {
	msg.channel.send('!')
	request('https://assets.ppy.sh/beatmaps/699749/covers/cover@2x.jpg').pipe(fs.createWriteStream('./assets/cover.jpg')).on('finish', () => {
		sharp(path.resolve(__dirname, '../assets/beatmap.svg')).resize(720).png().toBuffer().then((data) => {
			const attachment = new Discord.Attachment(data, 'user_stats.png');
			msg.channel.send(attachment)
			console.log(Date.now() - time)
		})
	})
	


}

module.exports.send = send;