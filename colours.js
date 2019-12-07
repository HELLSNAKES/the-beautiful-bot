const Vibrant = require('node-vibrant');
const FastAverageColor = require('fast-average-color')
function getVibrant(directory,callback) {
	Vibrant.from(directory,callback);
}

function getAverage() {
	var myColor = FastAverageColor.FastAverageColor.getColor('https://i1.sndcdn.com/artworks-000301064430-zeuz02-t500x500.jpg');
	return myColor;
}

getVibrant();