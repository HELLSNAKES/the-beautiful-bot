<img src='https://imgur.com/mMeQq7K'>

### Um, what is this
This is a bot that I developed for my own discord server.

1. To get this bot running on my machine first you will have to have [Node.js](https://nodejs.org/en/) and [git](https://git-scm.com/downloads) installed in your computer
2. For the module "canvas" that is heavily used in this project to work you will have to install several dependencies [[Installation]](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows). An easier way to install all the dependencies on your devices is to use [Chocolatey](https://chocolatey.org/) which is also explained at the bottom of the [installation guide](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows#install-with-chocolatey)
3. Type `git clone https://github.com/mooradal/The-Beautiful-Bot.git` in your command line in the directory you want the files to be cloned to
4. Type `npm install`
5. create a file called ".env" and fill it with the following information:
```
discordAPI = [Your Bots Discord Token]
yandexAPI = [Your yandex api key]
osuAPI = [your osu! api key]
dbPassword = [your MongoDB Database's Password]
dbUsername = [your MongoDB Database's Username]
```
Note that the bot was not made in a way to make it easy and fast to get it working and a better more user friendly version will be released soon.

5. You are good to go. You can run `node index.js` to run the bot.

### Features
 - [x] make the bot translate messages to English
 - [x] make the bot translate messages to Other languages
 - [x] Draw beatmap image
 - [x] Draw Title of beatmap and artist name
 - [x] Use the data of the difficulty on the url rather than the hardest difficulty
 - [x] Draw Stars
 - [x] Draw CS, AR, HP and OD with the bars
 - [x] Draw Beatmap's length, BPM, number of circles, number of sliders
 - [ ] Change all the positioning values from actual to relative for better responsive images.
 - [ ] ~~calculate the maximum number of pp (No mod) for a 100% acc FC, 95% acc FC and 90% acc FC and draw the result~~ **(This was cancelled because I didn't find any clear way to calculate pp)**
 - [x] Draw the maps avaliable difficulty and select the difficulty that is on the url
 - [ ] Create an Algorithm to change the background to a colour that fits the beatmap image **(Optional)**
 - [x] add a help command
 - [ ] make the bot do moderation **(Task needs to be broken down)**
 - [ ] Add a configuration command to configurate the bot.
 - [ ] make the bot send Beautiful pics 
 - [x] Open Source the bot
 - [x] Add another card for user stats
 - [x] Render the name and country of the user
 - [x] Draw the profile image of the user
 - [x] Make all the grade stats functional and render it on the card
 - [ ] Consider changing the cards from canvas based cards to SVG based cards for a higher quality images **(Optional)**
 - [x] Add proper commands for all the features of the bot including a prefix.
 - [x] Draw the current level of the user and add a level visualiser
 - [x] Drawing the user's current global and country ranks in the user stats images
 - [x] Draw the pp, accuracy and hours played
 - [x] Make background change randomly when generated (use osu's set of backgrounds)
 - [ ] Design improvement to the beatmap card to include more valuable information (e.g. Mapper, Whether ranked or not, etc). 
 - [ ] Add analytics to the bot **(Task needs to be broken down)**
 - [ ] Clean the code and remove unnecessary files **(Task needs to be broken down)**
 - [ ] add the ability to see stats on the most recent play
 - [ ] make the b!rs have the ability to the most recent number of plays that the user specifies.
 - [ ] allow the user to pick which recent play to show the stats for (for example: the one before the last recent play)
 - [x] Add a command that allows the user to see their top 5 best plays
 - [x] Add a command that allows the user to see their best recent play
 - [ ] Test the bots features
 - [ ] Consider adding the number of trys for a play to be acheived (this is refering to the b!rs command).
 - [x] link the bot to a database either an SQL or MongoDB database (preferably a mongodb database)
 - [x] use the database to store the users discord id with their corresponding osu id and make it useable in all osu commands
 - [ ] Last but not least release the bot publicly
 - [ ] Throw some discord presence spiciness.
 - [x] Display when the user gets a full combo on a map (b!rs)
 - [ ] Display when the user gets a new top play on a map (b!rs)
 - [ ] Change the pp calculations system to oppai's system (https://github.com/Francesco149/oppai/tree/master/node-oppai)
### Known bugs/Improvements
 - [x] Make the last star size change depending on the decimal exact difficulty
 - [x] Make diffuculties other than difficulty selected partially transparent
 - [x] The bot crashes if there is no beatmap image
 - [x] Stars overflow (visual error)
 - [ ] General tweaking (for example spacing, sizes, quality, etc)
 - [ ] Merge the getBeatmapData function and the asynchronous createCard function into one async function
 - [x] Change text alignment to center where appropriate to avoid several visual errors
 - [x] Add better formatting for numbers (for example 123,000 rather than 123000)
 - [x] User doesn't exist
 - [ ] Beatmapset doesn't exist
 - [ ] Beatmap not specified
 - [ ] incorrect language translation
 - [x] background--1.png doesn't exist error
 - [ ] The number of pp in the b!rs is inaccurate.
 - [ ] user with no profile image error in the b!rs command
 - [ ] can't find 'includes' of undefined.

 - [ ] general improvement to the fromatting of the "Achieved" section in the b!rs
 - [ ] changing the colour of the embed of the b!rs command
 - Note: The bot has been breifly tested and not full tested yet so if you find any bugs please contact me (or open an issue on github)

 Here is how the osu beatmap/user stats image should look like when its finished.
<img src="https://i.imgur.com/LPqEwxV.png" width="40%">

<img src="https://i.imgur.com/wunBfT4.png" width="40%">

<img src="https://i.imgur.com/uSAwLW2.png" width="40%">

<img src="https://i.imgur.com/NUf8kXw.png" width="40%">

<img src="https://i.imgur.com/fiXzutk.png" width="40%">