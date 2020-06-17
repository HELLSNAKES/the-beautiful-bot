'use strict';

import { IAPIUser } from './interfaces';

const request = require('request');

export function checkUser(user : string, serverType = 0): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		if (serverType == 0) {
			request(`https://osu.ppy.sh/api/get_user?k=${process.env.osuAPI}&u=${user}`, {
				json: true
			}, (err: any, res: any, body: Array<IAPIUser>) => {
				if (body.length == 0) reject();
				else resolve();
			});
		} else if (serverType == 1) {
			request(`https://api.gatari.pw/users/get?u=${user}`, {
				json: true
			}, (err: any, res: any, body: any) => {
				if (body.users.length == 0) reject();
				else resolve();
			});
		} else if (serverType == 2) {
			request(`https://akatsuki.pw/api/v1/users?name=${user}`, {
				json: true
			}, (err: any, res: any, body: any) => {
				if (body.code == 404) reject();
				else resolve();
			});
		}
	});
}

export function renameKey(object : any, oldKey : string, newKey : string) {
	if (oldKey === newKey) return object;

	if (Object.prototype.hasOwnProperty.call(object, oldKey)) {
		object[newKey] = object[oldKey];
		delete object[oldKey];
	}

	return object;
}