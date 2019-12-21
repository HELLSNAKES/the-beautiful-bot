<img src='https://i.imgur.com/YdQydyR.png'>

### Um, what is this
This is a bot that I developed for my own discord server.

1. To get this bot running on your machine first you will have to have [Node.js](https://nodejs.org/en/) and [git](https://git-scm.com/downloads) installed in your computer
2. (Windows only) For the module "canvas", that is heavily used in this project, to work you will have to install several dependencies [[Installation]](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows). An easier way to install all the dependencies on your devices is to use [Chocolatey](https://chocolatey.org/) which is also explained at the bottom of the [installation guide](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows#install-with-chocolatey)
3. Run `git clone https://github.com/mooradal/The-Beautiful-Bot.git` on your command line in the directory you want the files to be cloned to
4. Run `npm install` to install the modules required
5. create a file called ".env" and fill it with the following information:
```
discordAPI = [Your Bots Discord Token]
osuAPI = [your osu! api key]
dbPassword = [your MongoDB Database's Password]
dbUsername = [your MongoDB Database's Username]
prefix = [prefix] (Only if you want to have a different prefix)
```
Alternatively these values can be passed as environment variables

Note that the bot was not made in a way to make it easy and fast to get it working and a better more user friendly version will be released soon.

Note that the bot was not developed to be user friendly. A better setup process will be implemented in the future.

5. You are good to go. You can run `node index.js` to run the bot.

If you find any bugs please contact me (or open an [issue on github](https://github.com/Moorad/the-beautiful-bot/issues))
