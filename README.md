
<img src='https://i.imgur.com/V0A9rjw.png'>

![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/Moorad/the-beautiful-bot?style=flat-square) ![GitHub issues](https://img.shields.io/github/issues/Moorad/the-beautiful-bot?style=flat-square) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Moorad/the-beautiful-bot?style=flat-square)
![Travis (.com)](https://img.shields.io/travis/com/Moorad/the-beautiful-bot?style=flat-square)

### Um, what is this
This is a bot that I developed because why not :)

1. To get this bot running on your machine first you will have to have [Node.js](https://nodejs.org/en/)
2. (Windows only) For the module "canvas", that is heavily used in this project, to work you will have to install several dependencies [[Installation]](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows). An easier way to install all the dependencies on your devices is to use [Chocolatey](https://chocolatey.org/) which is also explained at the bottom of the [installation guide](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows#install-with-chocolatey)
3. Run `git clone https://github.com/mooradal/The-Beautiful-Bot.git` on your command line in the directory you want the files to be cloned to or download the files from Github
4. Run `npm install` to install the modules required
5. create a file called ".env" and fill it with the following information:
```
discordAPI = [Your Bots Discord Token]
osuAPI = [your osu! api key]
dbURI = [your MongoDB Database's URI]
prefix = [prefix] (Only if you want to have a different prefix)
```
Alternatively these values can be passed as environment variables

Note that the bot was not developed to be user friendly. A better setup process will be implemented in the future.

6. You are good to go. You can run `node index.js` to run the bot.

If you find any bugs please contact me (or open an [issue on github](https://github.com/Moorad/the-beautiful-bot/issues))
