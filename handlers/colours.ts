import { IColourContrast } from './interfaces';
// import * as error from '../handlers/error';

interface IGetColour {
	foreground: Colour,
	background: Colour
}

const Vibrant = require('node-vibrant');
const ColorThief = require('color-thief');
const axios = require('axios');

let colorThief = new ColorThief();

export class Colour {
	private value: Array<number> = [];

	public constructor(initalInputType: number, value: any) {
		if (initalInputType == 0) { // RGB
			this.value = value;
		} else if (initalInputType == 1) { // HEX
			this.modifyHEX(value);
		} else if (initalInputType == 2) { // HSL
			this.modifyHSL(value);
		} else {
			console.error('Invalid inital input type');
			this.value = [255,255,255];
		}
	}

	public getRGB() {
		return this.value;
	}

	public getHEX() {
		const componentToHex = (c: number) => {
			let hex = c.toString(16);
			return hex.length == 1 ? '0' + hex : hex;
		};

		return '#' + componentToHex(this.value[0]) + componentToHex(this.value[1]) + componentToHex(this.value[2]);
	}

	public getHSL() {
		let r = this.value[0];
		let g = this.value[1];
		let b = this.value[2];

		r /= 255, g /= 255, b /= 255;

		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h: any, s: any, v: any = max;

		var d = max - min;
		s = max == 0 ? 0 : d / max;

		if (max == min) {
			h = 0; // achromatic
		} else {
			switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		}

		return [h, s, v];
	}

	public modifyHEX(value: string) {
		value = value.replace('#', '');
		this.value = [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
	}

	public modifyRGB(values: Array<number>) {
		this.value = values;
	}

	public modifyHSL(values: Array<number>) {
		var r : any, g : any, b : any;

		var i = Math.floor(values[0] * 6);
		var f = values[0] * 6 - i;
		var p = values[2] * (1 - values[1]);
		var q = values[2] * (1 - f * values[1]);
		var t = values[2] * (1 - (1 - f) * values[1]);

		switch (i % 6) {
		case 0: r = values[2], g = t, b = p; break;
		case 1: r = q, g = values[2], b = p; break;
		case 2: r = p, g = values[2], b = t; break;
		case 3: r = p, g = q, b = values[2]; break;
		case 4: r = t, g = p, b = values[2]; break;
		case 5: r = values[2], g = p, b = q; break;
		}

		this.value = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
}

export function getColours(url: string) {
	return new Promise<IGetColour>((resolve : any, reject : any) => {
		if (url === undefined) reject('Missing URL');

		axios({
			method: 'get',
			url: url,
			responseType: 'arraybuffer'
		})
			.then((res: any) => {
				let dominant: any;
				try {
					dominant = new Colour(0, colorThief.getColor(res.data));
				} catch (err) {
					getColours('https://osu.ppy.sh/images/layout/beatmaps/default-bg@2x.png').then(resolve);
					return;
				}

				Vibrant.from(res.data).maxColorCount(64).getPalette(async function (err: any, palette: any) {

					if (err) reject(err);

					resolve({
						foreground: new Colour(1, palette.Vibrant.getHex()),
						background: dominant
					});
				});
			}).catch(reject);
	});

}

export function getContrastRatio(foreground: Colour, background: Colour): IColourContrast {

	let R1 = foreground.getRGB()[0] / 255;
	let R2 = background.getRGB()[0] / 255;
	let G1 = foreground.getRGB()[1] / 255;
	let G2 = background.getRGB()[1] / 255;
	let B1 = foreground.getRGB()[2] / 255;
	let B2 = background.getRGB()[2] / 255;

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
	let L1 = 0.2126 * R1 + 0.7152 * G1 + 0.0722 * B1;
	let L2 = 0.2126 * R2 + 0.7152 * G2 + 0.0722 * B2;

	let threshold = 4;

	if (L1 > L2) {
		if ((L1 + 0.05) / (L2 + 0.05) < threshold) {
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
		if ((L2 + 0.05) / (L1 + 0.05) < threshold) {
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

export function toReadable(foreground: Colour, background: Colour) {
	let contrastRatioLight = getContrastRatio(foreground, background);
	let contrastRatioDark = getContrastRatio(foreground, background);
	let counter = 0;

	while (!contrastRatioLight.readable && !contrastRatioDark.readable) {
		counter++;
		contrastRatioLight = getContrastRatio(brightness(foreground, counter), background);
		contrastRatioDark = getContrastRatio(brightness(foreground, -counter), background);

	}

	return {
		background: background,
		foreground: contrastRatioLight.readable ? contrastRatioLight.colours[0] : contrastRatioDark.colours[0]
	};
}


function brightness(colour: Colour, percent: number) {
	let num = parseInt(colour.getHEX().replace('#', ''), 16),
		amt = Math.round(2.55 * percent),
		R = (num >> 16) + amt,
		B = (num >> 8 & 0x00FF) + amt,
		G = (num & 0x0000FF) + amt;

	colour.modifyHEX('#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1));

	return colour;
}
