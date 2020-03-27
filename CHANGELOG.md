# Changelog

The beautiful bot's Changelog :)

## 1.3.5 25-03-2020

### Added
 - Full taiko support with pp calculation, FC pp calculation, Mods support, Mod difficulty rating and maximum combo of a map and completion percentage
 + Added Taiko maps support to $c
 + Partial Catch support with pp calculation, FC pp calculation, Mods support, Mod difficulty rating, maximum combo of map and completion percentage

### Changed
 - Changed the pp handler to a better, faster and more up to date version C implementation

## 1.3.4.2 22-03-2020

## Changed
 - Improved the mod parser and now it will be able to detect: 4K-9K, V2 and Mirror on ranked plays. It will detect the following mods if they get submitted somehow (e.g. private server): 1K-3K, Coop, Autoplay, Autopilot, Random and Cinema

## 1.3.4.1 21-03-2020

### Changed
 - Redesigned the user card
 - Removed a lot of unnecessary image and font files
 
### Fixed
 - level bar in user card looks weird when progress level is very very low (smaller than 2%)
 - unable to ping people when using $osu
 - user links are not parsed correctly resulting in an error

## 1.3.4 19-03-2020

### Added
 - All modes including standard, mania, taiko and ctb will show in beatmap cards

### Changed
 - Redesigned the beatmap card
 - Added minimum star size so that maps with a low difference between difficulty rating and floored difficulty rating dont look odd.
 - The threshold for the allowed minimum contrast between colours has been reduced from 4.5 to 3.5.
 
### Fixed
 - Showing 9 maximum stars instead of 10
 - max combo showing null when showing mania, taiko or ctb maps
 - Showing difficulties in the wrong order in beatmap card
 - Wrong difficulty selected when parsing beatmap urls

## 1.3.3 04-03-2020

### Added 
 - Replay download link if available when using $c
 - Direct, bloodcat and TBB stats buttons change depending on the rank achieved

### Changed
 - Updated the design of $best

### Fixed
 - Showing undefined calculated diffiulty when using $compare	

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