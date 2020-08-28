import { Colour } from './colours';

export interface IOptions {
	previous?: number,
	mode?: number | undefined,
	type?: number,
	relax?: boolean,
	mods?: [boolean, string],
	passesonly?: boolean,
	ppv3?: boolean, 
	error: boolean,
	[index: string] : any
	
}

export interface IOjsamaOptions {
	mods?: string | number,
	accuracy?: number,
	combo?: number,
	misses?: number,
	mode?: number,
	ppv3?: boolean
}

export interface IArgument {
	name: string,
	description?: string,
	aliases?: Array<string>,
	isSwitch?: boolean,
	default?: any,
	validator?: (x: any) => any,
	validatorText?: string,
	allowedValues?: object | string,
	process?: (x: any) => any,
	processOptions?: (x : IOptions, z: string) => IOptions, //This is called only if noArugment is true
	noInitialPrefix?: boolean,
	noArgument?: boolean
}

export interface IDBDocument {
	_id?: {
		'$oid': string
	},
	type?: number,
	mode?: number,
	discordID?: string,
	osuUsername?: string,
	serverID?: string,
	prefixOverwrite?: string,
	lastChecked?: number,
	mapFeedChannelID?: string,
	cookie?: string
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
	colours: [Colour, Colour],
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

export interface IAPIRecent {
	beatmap_id: string,
	score: string,
	maxcombo: string,
	count50: string,
	count100: string,
	count300: string,
	countmiss: string,
	countkatu: string,
	countgeki: string,
	perfect: string,
	enabled_mods: string,
	user_id: string,
	date: string,
	rank: string
}

export interface IAPIBest {
	beatmap_id: string,
	score_id: string,
	score: string,
	maxcombo: string,
	count50: string,
	count100: string,
	count300: string,
	countmiss: string,
	countkatu: string,
	countgeki: string,
	perfect: string,
	enabled_mods: string,
	user_id: string,
	date: string,
	rank: string,
	pp: string,
	replay_available: string
}

export interface IAPIUser {
	user_id: string,
	username: string,
	join_date: string,
	count300: string,
	count100: string,
	count50: string,
	playcount: string,
	ranked_score: string,
	total_score: string,
	pp_rank: string,
	level: string,
	pp_raw: string,
	accuracy: string,
	count_rank_ss: string,
	count_rank_ssh: string,
	count_rank_s: string,
	count_rank_sh: string,
	count_rank_a: string,
	country: string,
	total_seconds_played: string,
	pp_country_rank: string,
	events?: any
}

export interface IURLParserBeatmap {
	URL: string | undefined,
	beatmapID: string | undefined,
	beatmapsetID: string | undefined,
	ruleset: number,
	valid: boolean
}

export interface IAPIGetBeatmapOptions {
	// since: number, // never used
	beatmapID?: string,
	beatmapSetID?: string,
	user?: string,
	// type: string, // never used
	ruleset?: number,
	converted?: boolean,
	hash?: boolean,
	// limit: number, // never used
	mods?: number
}