export interface IOptions {
	previous?: number,
	mode?: number | undefined,
	type?: number,
	relax?: boolean,
	mods?: [boolean, number],
	error: boolean
}

export interface IOjsamaOptions {
	mods?: string | number,
	accuracy?: number,
	combo?: number,
	misses?: number,
	mode?: number
}

export interface IArgument {
	name: string,
	description: string,
	aliases?: Array<string>,
	isSwitch?: boolean,
	default?: any,
	validator?: (x: any) => any,
	validatorText?: string,
	allowedValues?: object | string,
	process?: (x: any) => any,
	noInitialPrefix?: boolean
}

export interface IDBUser {
	_id?: {
		'$oid': string
	},
	type?: number,
	mode?: number,
	discordID?: string,
	osuUsername?: string
}

export interface ICommand {
	name?: string,
	description?: string,
	aliases?: Array<string>,
	group?: string,
	options?: Array<IArgument>,
	arguments?: Array<IArgument>,
	example?: Array<string>,
	[key: string]: any
}

export interface IColourContrast {
	colours: [Array<number>, Array<number>],
	ratio: number,
	readable: boolean,
	luminosity: [number, number]
}

export interface IPPAttributes {
	title: string,
	artist: string,
	difficultyName: string,
	creator: string,
	AR: number | string,
	OD: number | string,
	CS: number | string,
	HP: number | string,
	stars: number | string,
	mods: number,
	combo: string,
	accuracy: number | string,
	pp: number
}