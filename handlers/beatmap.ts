import * as error from '../handlers/error';

export function getVariableBPM(constantBPM : any, BPMMin : any, BPMMax : any, timingPoints : any, totalTime  : any, clockRate = 1) {
	const infiniteBPMThreshold = 2400;
	if (BPMMin != undefined && BPMMax != undefined) {
		var BPMTimingPoints = timingPoints.filter((x : any) => x.timingChange);
		var uniqueBPMs : Array<number> = [];
		var BPMLengths : Array<number> = [];
		for (var i = 0; i < BPMTimingPoints.length; i++) {
			
			if (!uniqueBPMs.includes(BPMTimingPoints[i].bpm)) {
				uniqueBPMs.push(BPMTimingPoints[i].bpm);
				BPMLengths.push(0);
			}
			
			if (i < BPMTimingPoints.length - 1) {
				BPMLengths[uniqueBPMs.indexOf(BPMTimingPoints[i].bpm)] += BPMTimingPoints[i + 1].offset - BPMTimingPoints[i].offset;
			} else {
				BPMLengths[uniqueBPMs.indexOf(BPMTimingPoints[i].bpm)] += (totalTime * 1000) - BPMTimingPoints[i].offset;	
			}
		}
		var modeAverageBPM = uniqueBPMs[BPMLengths.indexOf(Math.max(...BPMLengths))]; 

		if (BPMMin > infiniteBPMThreshold) BPMMin = '∞';
		if (BPMMax > infiniteBPMThreshold) BPMMax = '∞';
		
		return BPMMin == BPMMax ? BPMMax * clockRate : `${BPMMin * clockRate} - ${BPMMax * clockRate} (${modeAverageBPM * clockRate})`;
	} else {
		error.unexpectedError(new Error('BPM could not be parsed from the .osu file'), 'Message Content: '+ constantBPM + ' : ' + BPMMin + ' :'  + BPMMax + ':' + JSON.stringify(timingPoints) + ' : ' + clockRate);
		return constantBPM;
	}
}