const sharp = require('sharp');
const Discord = require('discord.js');
const path = require('path');
var time = Date.now();

function send(msg) {
	msg.channel.send('!')
	sharp(path.resolve(__dirname, '../assets/clock.svg')).resize(720).png().toBuffer().then((data) => {
		const attachment = new Discord.Attachment(data, 'user_stats.png');
		msg.channel.send(attachment)
		console.log(Date.now() - time)
	})


}

module.exports.send = send;