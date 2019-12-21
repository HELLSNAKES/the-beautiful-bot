const Vibrant = require('node-vibrant');
const ColorThief = require('color-thief');
// const fs = require('fs');
const request = require('request');
var colorThief = new ColorThief();

function toHex(array) {
	let componentToHex = (c) => {
		var hex = c.toString(16);
		return hex.length == 1 ? '0' + hex : hex;
	};

	return '#' + componentToHex(array[0]) + componentToHex(array[1]) + componentToHex(array[2]);
}

function toRGB(hex) {
	hex = hex.replace('#', '');
	return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function getColours(url, options, callback) {
	if (url === undefined) {
		throw 'Missing URL';
	}
	if (callback === undefined) {
		callback = options;
		options = {};
	}

	request({
		url,
		encoding: null
	}, (err, res, body) => {
		var dominant = colorThief.getColor(body);
		Vibrant.from(body).maxColorCount(64).getPalette(async function (err, palette) {


			var backgroundColour = toHex(dominant);
			var foregroundColour = palette.Vibrant.getHex();
			callback({
				foreground: foregroundColour,
				background: backgroundColour
			});
		});
	});


}

function getContrastRatio(foreground, background) {

	var R1 = foreground[0] / 255;
	var R2 = background[0] / 255;
	var G1 = foreground[1] / 255;
	var G2 = background[1] / 255;
	var B1 = foreground[2] / 255;
	var B2 = background[2] / 255;

	if (R1 <= 0.03928) {
		R1 = R1 / 12.92;
	} else {
		R1 = ((R1 + 0.055) / 1.055) ** 2.4;
	}

	if (R2 <= 0.03928) {
		R2 = R2 / 12.92;
	} else {
		R2 = ((R2 + 0.055) / 1.055) ** 2.4;
	}

	if (G1 <= 0.03928) {
		G1 = G1 / 12.92;
	} else {
		G1 = ((G1 + 0.055) / 1.055) ** 2.4;
	}

	if (G2 <= 0.03928) {
		G2 = G2 / 12.92;
	} else {
		G2 = ((G2 + 0.055) / 1.055) ** 2.4;
	}

	if (B1 <= 0.03928) {
		B1 = B1 / 12.92;
	} else {
		B1 = ((B1 + 0.055) / 1.055) ** 2.4;
	}

	if (B2 <= 0.03928) {
		B2 = B2 / 12.92;
	} else {
		B2 = ((B2 + 0.055) / 1.055) ** 2.4;
	}
	var L1 = 0.2126 * R1 + 0.7152 * G1 + 0.0722 * B1;
	var L2 = 0.2126 * R2 + 0.7152 * G2 + 0.0722 * B2;

	if (L1 > L2) {
		if ((L1 + 0.05) / (L2 + 0.05) < 4.5) {
			return {
				colours: [foreground, background],
				ratio: (L1 + 0.05) / (L2 + 0.05),
				readable: false,
				luminosity: [L1, L2]
			};
		} else {
			return {
				colours: [foreground, background],
				ratio: (L1 + 0.05) / (L2 + 0.05),
				readable: true,
				luminosity: [L1, L2]
			};
		}
	} else {
		if ((L2 + 0.05) / (L1 + 0.05) < 4.5) {
			return {
				colours: [foreground, background],
				ratio: (L2 + 0.05) / (L1 + 0.05),
				readable: false,
				luminosity: [L1, L2]
			};
		} else {
			return {
				colours: [foreground, background],
				ratio: (L2 + 0.05) / (L1 + 0.05),
				readable: true,
				luminosity: [L1, L2]
			};
		}
	}

}

function toReadable(foreground, background) {
	let contrastRatioLight = getContrastRatio(foreground, background);
	let contrastRatioDark = getContrastRatio(foreground, background);
	let counter = 0;

	while (!contrastRatioLight.readable && !contrastRatioDark.readable) {
		counter++;
		contrastRatioLight = getContrastRatio(toRGB(brightness(toHex(foreground), counter)), background);
		contrastRatioDark = getContrastRatio(toRGB(brightness(toHex(foreground), -counter)), background);

	}

	return {
		background: background,
		foreground: contrastRatioLight.readable ? contrastRatioLight.colours[0] : contrastRatioDark.colours[0]
	};
}


var brightness = function (color, percent) {
	var num = parseInt(color.replace('#', ''), 16),
		amt = Math.round(2.55 * percent),
		R = (num >> 16) + amt,
		B = (num >> 8 & 0x00FF) + amt,
		G = (num & 0x0000FF) + amt;

	return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
};

module.exports.getColours = getColours;
module.exports.toReadable = toReadable;
module.exports.brightness = brightness;
module.exports.toHex = toHex;
module.exports.toRGB = toRGB;