# Changelog

The beautiful bot's Changelog :)

## 1.3.3 04-03-2020

## 1.3.2 01-03-2020

### Added
 - A new hyperlink to the TBB stats page when you use $rs
 - Akatsuki partial support ($rs, $best, $osu)
 - Support for selecting a user in $c other than themselves e.g. $compare Vaxei or $ compare @Moorad
 - Flags in $osu

## Changed
 - Profile picture rendering in $osu supports non-square images
 - Updated $help
 - Redesigned $rs
 - Added akatsuki ping latency to $ping
 - Added number of servers and users to $ping
 - slightly modified the game activity messages
 
### Fixed
 - Bot not reponding if a user typed `$rs` and the user is not found


## 1.3.1 - 10-02-2020

### Added
- New activity message that will show the number of servers that the bot is in

### Changed
- The activity messages now change every 2.5 min rather than 5 min


## 1.3.0 - 08-02-2020

### Added

- Changelog file
- New $pp command that will calculate the pp for a map
- New $leaderboard command to display the leaderboard of a map
- $ping command to measure the latency of all APIs
- A Bloodcat download option is available when showing a recent play
- Iimited support for Taiko and CTB
- Partial support to Gatari accounts (only $c and all the mods except standard are not supported)
- Added pagination to $help
- MIT License

### Changed

- New logo for the bot
- Changed the name of the bot from "TheBeautifulBot v1.2" to "TBB v1.3"
- $osuset can rename users
- Every command has been split to its own file and shared handlers has been created
- Added 4 badges in the README.md file
- Improved preformance when using $map due to the use of osu!'s search API rather than osusearch
- Significantly improved the chat search for the latest mention map system ($c is more reliable now)
- Errors are more user friendly
- Rank status of a map is now shown on the $rs embed
- Database writing, reading and updating uses the new URL parser and the new Server Discover and Monitoring engines
- $changelog no longer shows the changelog due to the changelog being too long. $changelog now shows you where you can find the latest changelog

### Removed

- $osurename which is now a part of $osuset
- Unnecessary testing file and 3 unused images

### Fixed
- Converted mania, taiko and ctb plays show null
- The CS bar showing the wrong value
- The last star in beatmap cards was slightly oversized
- Discord caching embed images
- $changelog not showing up due to the character count exceeding the 2048 character limit
- The command $osurename ($osuset now is able to add a user and change the account linked)