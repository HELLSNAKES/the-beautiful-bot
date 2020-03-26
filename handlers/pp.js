const {
	exec,
	execSync
} = require('child_process');

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
		jsonOutput.stars = parseFloat(formattedOut[4].slice(0, formattedOut[4].indexOf(' stars')))

		// Extract Mods, Combo and accuracy
		jsonOutput.mods = (formattedOut[5].includes('+') ? formattedOut[5].slice(formattedOut[5].indexOf('+') + 1, formattedOut[5].indexOf(' ')) : '')
		jsonOutput.combo = formattedOut[5].match(/\d+\/\d+x/g)[0]
		jsonOutput.accuracy = formattedOut[5].match(/[\d\.]+%/)[0]

		// Extract pp
		jsonOutput.pp = formattedOut[6].slice(0, formattedOut[6].indexOf(' pp'))

		callback(jsonOutput)
		return jsonOutput;
	}
	var cmd = `curl -s https://osu.ppy.sh/osu/${beatmapId} | "./handlers/pp/oppai" - ${(options.string ? options.string : `${(options.mods ? '+'+options.mods : '')} ${(options.accuracy ? options.accuracy+'%' : '')} ${(options.combo ? options.combo+'x' : '')} ${(options.misses ? options.misses+'m' : '')} ${(options.count100 ? options.count100+'x100' : '')} ${(options.count50 ? options.count50+'x50' : '')}`)}`
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

// console.log(calculatepp(846259, {sync:true}))

function calculateCatchpp() {

}

module.exports = {
	calculatepp: calculatepp
}