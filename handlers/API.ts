import axios from 'axios';

import * as gatari from '../handlers/gatari';
import * as akatsuki from '../handlers/akatsuki';

import { IAPIBest, IAPIRecent, IAPIUser } from './interfaces';

export function getRecent(userID : string, ruleset = 0, serverType = 0, relax = false) : Promise<Array<IAPIRecent>> {
	return new Promise((resolve, reject) => {
		if (serverType == 0) {
			axios.get(`https://osu.ppy.sh/api/get_user_recent?k=${process.env.osuAPI}&u=${userID}&limit=50&m=${ruleset}`)
				.then((res) => {
					resolve(res.data);
				}).catch(reject);
		} else if (serverType == 1) {
			axios.get(`https://api.gatari.pw/user/scores/recent?id=${userID}&l=100&mode=${ruleset}&f=1`)
				.then((res) => {
					resolve(gatari.recent(userID, res.data));
				}).catch(reject);
		} else if (serverType == 2) {
			axios.get(`https://akatsuki.pw/api/v1/users/scores/recent?id=${userID}&rx=${relax ? 1 : 0}`)
				.then((res) => {
					resolve(akatsuki.recent(userID, res.data));
				}).catch(reject);
		} else {
			reject(new Error(serverType + ' is not a valid server type'));
		}
	});
}

export function getBest(userID : string, ruleset = 0, serverType = 0, relax = false) : Promise<Array<IAPIBest>> {
	return new Promise((resolve, reject) => {
		if (serverType == 0) {
			axios.get(`https://osu.ppy.sh/api/get_user_best?k=${process.env.osuAPI}&u=${userID}&limit=100&m=${ruleset}`)
				.then((res) => {
					resolve(res.data);
				}).catch(reject);
		} else if (serverType == 1) {
			axios.get(`https://api.gatari.pw/user/scores/best?id=${userID}&l=100`)
				.then((res) => {
					resolve(gatari.best(userID, res.data));
				}).catch(reject);
		} else if (serverType == 2) {
			axios.get(`https://akatsuki.pw/api/v1/users/scores/best?id=${userID}&rx=${relax ? 1 : 0}&l=100`)
				.then((res) => {
					resolve(akatsuki.best(userID, res.data));
				}).catch(reject);
		} else {
			reject(new Error(serverType + ' is not a valid server type'));
		}
	});
}

export function getUser(userID : string, ruleset = 0, serverType = 0, relax = false) : Promise<Array<IAPIUser>> {
	return new Promise((resolve, reject) => {
		if (serverType == 0) {
			axios.get(`https://osu.ppy.sh/api/get_user?k=${process.env.osuAPI}&u=${userID}&m=${ruleset}`)
				.then((res) => {
					resolve(res.data);
				}).catch(reject);
		} else if (serverType == 1) {
			axios.get(`https://api.gatari.pw/users/get?u=${userID}`)
				.then((resGet) => {
					axios.get(`https://api.gatari.pw/user/stats?u=${userID}`)
						.then((resStats) => {
							resolve([gatari.user(resGet.data, resStats.data)]);
						}).catch(reject);
				}).catch(reject);
		} else if (serverType == 2) {
			axios.get(`https://akatsuki.pw/api/v1/users/${relax ? 'rx' : ''}full?id=${userID}`)
				.then((res) => {
					resolve([akatsuki.user(res.data)]);
				}).catch(reject);
		} else {
			reject(new Error(serverType + ' is not a valid server type'));
		}
	});
}