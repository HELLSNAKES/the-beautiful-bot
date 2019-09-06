require('dotenv').config()
const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');
const client = new Discord.Client();
const Canvas = require('canvas');
const languageCodes = JSON.parse(fs.readFileSync('language_codes.json'))


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    msg.content = msg.content.toLowerCase();
    if (msg.content === 'bot you alive?') {
        msg.reply('**YES!!!**');
    } else if (msg.content === 'cat') {
        request('https://api.thecatapi.com/v1/images/search', function (err, res, body) {
            msg.reply(JSON.parse(body)[0].url);
        });
    } else if (msg.content.startsWith('translate')) {
        var parameter = msg.content.replace('translate', '').trim();
        console.log(parameter)
        if (!parameter) {
            msg.channel.fetchMessages({
                limit: 2
            }).then(messages => {
                var lastMessage = messages.last();
                console.log(lastMessage)
                if (!lastMessage.author.bot) {
                    request(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${process.env.yandexAPI}&text=${encodeURIComponent(messages.last().content)}&lang=en`,
                        function (err, res, body) {
                            body = JSON.parse(body);
                            langFrom = body.lang.split('-')[0]
                            for (var i of languageCodes.languageCodes) {
                                if (i[0] == langFrom) {
                                    langFrom = i[1];
                                    break;
                                }
                            }
                            console.log(body.text[0])
                            console.log(`Language Detected: **${langFrom}**`)
                            msg.reply(`Translation: **${body.text[0]}**\nLanguage Detected: ${langFrom}`)
                        })
                }

            })
        } else {
            parameter = parameter[0].toUpperCase() + parameter.slice(1).toLowerCase();
            for (var i of languageCodes.languageCodes) {
                if (i[1] == parameter) {
                    lang = `en-${i[0]}`
                }
            }
            msg.channel.fetchMessages({
                limit: 2
            }).then(messages => {
                var lastMessage = messages.last();
                console.log(lastMessage)
                if (!lastMessage.author.bot) {
                    request(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${process.env.yandexAPI}&text=${encodeURIComponent(messages.last().content)}&lang=${lang}`,
                        function (err, res, body) {
                            body = JSON.parse(body);
                            console.log(body.text[0])
                            console.log(`Language Detected: **${parameter}**`);
                            msg.reply(`Translation: **${body.text[0]}**\nLanguage Detected: ${parameter}`);
                        })
                }
            });
        }
    } else if (msg.content.includes('bye')) {
        msg.reply('See you next time ;). I hope you get the Joke.');
    } else if (msg.content === 'good bot') {
        msg.reply('<:heart:' + 615531857253105664 + '>');
        // console.log(emoji)
    }
});
console.log(process.env.discordAPI)
client.login(process.env.discordAPI);