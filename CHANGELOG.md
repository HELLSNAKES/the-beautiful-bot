# Changelog

The beautiful bot's Changelog :)

## 1.4.0 10-06-20

### Added
 - A completely new help system that is more condense, easier to read and more helpful
 - A new algorithm for parsing arguments
 - Arguments are not longer case sensitive
 - Support for argument aliases e.g. you can use -previous now instead of only -p
 - Argument errors are a lot more clearer than before
 - A wider support for command aliases (e.g. you can use $best, $bt and $top to show your top plays)
 - A new error system that will automatically report errors and will tell the user if an unexpected error occur.
 - Support for catch, taiko and mania in $best
 - Implemented -taiko, -catch, -mania & -standard replacing -m [mode]
 - Replay parsing. The bot can parse osu standard, catch and mania replay files and show a score embed
 - Added a new -passesonly to $rs to show the most recent passed play (No failed plays)
 - $c now will indicate whether other plays with other mod combinations are available.
 - Implemented -mods [mod abbriviations] to $c to show a play with a different mod combination
 - Added support for displaying bpm ranges in beatmap images
 - URLs like https://osu.ppy.sh/b/1245003 and https://osu.ppy.sh/s/588018 and more can now be parsed.
 - Custom prefixes
 - Added a new status message
 - $compare now supports taiko, catch and mania
 - Implemented an algorithm to predict what command you meant to use when the command is not recognised
 - Implemented failed requests in $ping
 - Implemented database caching with read, write and update functionality
 - Added a $flush command for flushing the cache
 - A simple $invite command
 - Added a few more countries to the country code list
 - Implemented a rank feed and a new $mapfeed command
 - Added a new -ppv3 argument to $pp and $rs to use the new delta algorithm for calculating pp rather than the current algorithm.
 - Implemented unit testing to partial automate bot testing 

### Fixed
 - Bot not generating a beatmap image and throwing an error when the mapper does not have a profile picture set.
 - Using an incorrect Gatari and Akatsuki usernames crashes the bot.
 - Accuracy and star rating being slightly off in some cases (±0.01)
 - Showing the incorrect status icon when using $rs for akatsuki and gatari users
 - Fixed @ing the bot throws an error
 - The bot will no longer allow you to set an invalid username
 - $best will show the calculated difficulty with mods rather than the base difficulty
 - using NC breaks mods displayed on $pp
 
### Changed
 - The entire codebase has been rewritten from JavaScript to TypeScript
 - Argument space spliting, now extra spaces are ignored e.g. "$osu -m 0    Moorad"
 - Renamed $osuset to $set, $osuset is now an alias
 - Implemented new normalisers for gatari and akatsuki
 - Refactored a lot of code
 - Implemented database options to database handlers. This will allow things like disable logging, unset document properties and disable caching.

### Removed
 - Removed pp.js submodule and used tbbpp instead

### Security
 - Enabled strict mode on all files
 - Fixed 7 low severity vulnerabilities in the project dependencies

## 1.3.5.2 03-04-2020

### Added 
 - taiko, catch and mania equivelants of $osu 

## 1.3.5.1 02-04-2020

### Added
 - Filtering best plays by mods

### Changed
 - Implemented a better user URL parser

## 1.3.5 29-03-2020

### Added
 - Preformance points calculation for taiko and catch
 - Maximum combo out of achieved combo in taiko
 - Completion percentage for taiko and catch
 - $modeset which will set your default mode to taiko, catch, mania or standard.
 - Added a lot more information in $pp including beatmap values such as AR and CS and BPM that will change with the mods applied.
 - Test file for the future and for Travis CI tests to pass correctly
### Changed
 - ~~Changed the pp handler to a better, faster and more up to date version C implementation~~ (This had cross platform inconsistencies) Used native ojsama rather than command line implementation.
 - The threshold for the allowed minimum contrast between colours has been reduced from 4.5 to 4.0.
 
### Fixed
 - Bot crashing when a previous play is requested that is older than what is returned by the osu! API
 - Bot crashing if you search for a map that doesn't exist using $map
 - Show the actual pp for a FC in taiko rather than showing osu!standard's pp for a FC in taiko
 - Incorrect accuracy for mania and catch
 - Calculated difficulty with mods showing undefined in taiko and catch
 - pp not rounded when using $c
 - Bot crashing when the data that is passed in $pp couldn't be parsed.
 - Bot crashing when url cant be parsed
 - Bot not working when you try to ping someone using $rs and they don't have an account linked
 - Bot crashing when using $best and $c or someone pinging a user without linking your account
 - Bot crashing when pinging non-standard accounts in $osu
 - Bot not respecting mode and user type across commands

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