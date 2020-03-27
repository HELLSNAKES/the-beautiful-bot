const {
	exec,
	execSync
} = require('child_process');
const ctb = require('ctb-pp-calc')
const mods = require('./mods');
function calculatepp(beatmapId, options, callback = () => {}) {
	var processCallback = (stdout, err) => {
		if (err) console.log(err)

		var jsonOutput = {
			error: null
		}
		
		if (stdout == 'requested a feature that isn\'t implemented\r\n') {
			jsonOutput.error = 'Unsupported mode'
			callback(jsonOutput)
			return jsonOutput;
		}
		// remove \r and split each line
		var stdOutSplit = stdout.replace(/\r/g, '').split('\n')
		var formattedOut = []
		//
		for (var i = 0; i < stdOutSplit.length; i++) {
			if (stdOutSplit[i] != '' && !stdOutSplit[i].trim().startsWith('speed strain:') && !stdOutSplit[i].trim().startsWith('aim strain:')) {
				formattedOut.push(stdOutSplit[i].trim())
			}
		}

		// Extract title, name, difficulty name and mapper
		jsonOutput.artist = formattedOut[0].split(' - ')[0];
		jsonOutput.title = formattedOut[0].split(' - ')[1]
		jsonOutput.title = jsonOutput.title.slice(0, jsonOutput.title.indexOf('[') - 1)
		jsonOutput.difficultyName = formattedOut[0].slice(formattedOut[0].indexOf('[') + 1, formattedOut[0].indexOf(']'))
		jsonOutput.creator = formattedOut[0].slice(formattedOut[0].indexOf('mapped by ')).replace('mapped by ', '')

		// Extract AR, OD, CS and HP
		var values = formattedOut[1].split(' ');
		// standard
		if (values.length > 3) {
			jsonOutput.AR = parseFloat(values[0].replace('AR', ''))
			jsonOutput.OD = parseFloat(values[1].replace('OD', ''))
			jsonOutput.CS = parseFloat(values[2].replace('CS', ''))
			jsonOutput.HP = parseFloat(values[3].replace('HP', ''))
		}
		// Taiko
		else {
			jsonOutput.AR = parseFloat(values[0].replace('AR', ''))
			jsonOutput.OD = parseFloat(values[1].replace('OD', ''))
			jsonOutput.HP = parseFloat(values[2].replace('HP', ''))
		}
		// Extract hitwindow
		jsonOutput.hitWindow = formattedOut[2].replace('300 hitwindow: ', '')

		// Extract Calculated Difficulty
		jsonOutput.stars = Math.round(parseFloat(formattedOut[4].slice(0, formattedOut[4].indexOf(' stars')))*100)/100

		// Extract Mods, Combo and accuracy
		jsonOutput.mods = (formattedOut[5].includes('+') ? formattedOut[5].slice(formattedOut[5].indexOf('+') + 1, formattedOut[5].indexOf(' ')) : '')
		jsonOutput.combo = formattedOut[5].match(/\d+\/\d+x/g)[0]
		jsonOutput.accuracy = formattedOut[5].match(/[\d\.]+%/)[0].replace('%', '')

		// Extract pp
		jsonOutput.pp = formattedOut[6].slice(0, formattedOut[6].indexOf(' pp'))

		callback(jsonOutput)
		return jsonOutput;
	}
	var cmd = `curl -s https://osu.ppy.sh/osu/${beatmapId} | "./handlers/pp/oppai" - ${(options.string ? options.string : `${(options.mods ? '+'+options.mods : '')} ${(options.accuracy ? options.accuracy+'%' : '')} ${(options.combo ? options.combo+'x' : '')} ${(options.misses ? options.misses+'m' : '')} ${(options.count100 ? options.count100+'x100' : '')} ${(options.count50 ? options.count50+'x50' : '')} ${(options.mode ? '-m'+options.mode : '')} `)}`
	if (options.sync) {
		var output = execSync(cmd);
		console.log(output)
		return processCallback(output.toString(), null);
	} else {
		exec(cmd, (err, stdout) => {
			processCallback(stdout, err);
		});
	}
}

function calculateCatchpp(data) {
	var value = Math.pow(5 * Math.max(1,(data.diff_aim) / 0.0049)- 4, 2) / 100000;
	console.log(value)
	var totalHits = parseInt(data.count300) + parseInt(data.count100) + parseInt(data.countmiss);
	
	var lengthBonus = 0.95 + 0.4 * Math.min(1, totalHits / 3000) + (totalHits > 3000 ? Math.log10(totalHits / 3000) * 0.5 : 0)
	value *= lengthBonus;
	value *= Math.pow(0.97, data.countmiss);

	if (data.max_combo > 0) {
		value *= Math.min(Math.pow(data.maxcombo,0.8) / Math.pow(data.max_combo, 0.8), 1);
	}

	var approachRateFactor = 1;
	if (data.diff_approach > 9) {
		approachRateFactor += 0.1 * (data.diff_approach - 9);
	} else if (data.diff_approach < 8) {
		approachRateFactor += 0.025 * (8 - data.diff_approach);
	}

	value *= approachRateFactor
	var enabled_mods = mods.toString(data.enabled_mods);
	if (enabled_mods.includes('HD')) {
		value *= 1.05 + 0.075 * (10 - Math.min(10,data.diff_approach));
	}

	if (enabled_mods.includes('FL')) {
		value *= 1.35 * lengthBonus;
	}

	value *= Math.pow(data.accuracy/100, 5.5);

	if (enabled_mods.includes('NF')) {
		value *= 0.9;
	}

	if (enabled_mods.includes('SO')) {
		value *= 0.95;
	}

	return {
		title: data.title,
		artist: data.artist,
		difficultyName: data.version,
		creator: data.creator,
		AR: data.diff_approach,
		OD: data.diff_overall,
		CS: data.diff_size,
		HP: data.diff_drain,
		stars: data.difficultyrating,
		mods: enabled_mods,
		combo: data.maxcombo+'/'+data.max_combo+'x',
		accuracy: data.accuracy,
		pp: Math.floor(value * 100)/100
	}
}

// console.log(calculateCatchpp({ beatmap_id: '2279135',
// score: '57780',
// maxcombo: '56',
// count50: '116',
// count100: '0',
// count300: '56',
// countmiss: '0',
// countkatu: '0',
// countgeki: '7',
// perfect: '1',
// enabled_mods: '1',
// user_id: '14392546',
// date: '2020-03-26 23:50:28',
// rank: 'X',
// beatmapset_id: '1090219',
// approved: '1',
// total_length: '26',
// hit_length: '26',
// version: 'Comfy Easy',
// file_md5: '25ef93ead73c67502a415117928d2518',
// diff_size: '3',
// diff_overall: '2',
// diff_approach: '2',
// diff_drain: '2',
// mode: '0',
// count_normal: '18',
// count_slider: '18',
// count_spinner: '1',
// submit_date: '2020-01-06 18:49:20',
// approved_date: '2020-01-14 12:25:49',
// last_update: '2020-01-06 21:13:07',
// artist: 'Asaka',
// artist_unicode: '亜咲花',
// title: 'The Sunshower (TV Size)',
// title_unicode: 'The Sunshower (TV Size)',
// creator: 'hypercyte',
// creator_id: '9155377',
// bpm: '86',
// source: 'Heya CampΔ',
// tags:
//  'へやキャン△ heyakyanΔ ゆるキャン△ yurucamp yuru camp yurukyan laid-back camp tent japanese anime hypercute iceluin its comfy time',
// genre_id: '3',
// language_id: '3',
// favourite_count: '27',
// rating: '8.71975',
// storyboard: '0',
// video: '0',
// download_unavailable: '0',
// audio_unavailable: '0',
// playcount: '9792',
// passcount: '6147',
// packs: 'S857',
// max_combo: '56',
// diff_aim: '0.829429',
// diff_speed: null,
// difficultyrating: '0.829429',
// accuracy: 100 }))

module.exports = {
	calculatepp: calculatepp,
	calculateCatchpp: calculateCatchpp
}