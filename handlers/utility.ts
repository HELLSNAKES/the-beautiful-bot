import * as error from '../handlers/error';

const axios = require('axios');

export function checkUser(user : string, serverType = 0): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		if (serverType == 0) {
			axios.get(`https://osu.ppy.sh/api/get_user?k=${process.env.osuAPI}&u=${user}`)
				.then((res: any) => {
				// console.log(res.statusCode)
					if (res.statusCode == 401) return reject(new Error('Unauthorised error. possibly: No valid API key was provided'));
					if (res.data.length == 0) return reject(new Error( 'No user with the specified username/user id was found'));
					else return resolve(String(res.data[0].user_id));
				}).catch((err : Error) => {error.unexpectedError(err, `While running checkUser() : ${user} : ${serverType}`);});
		} else if (serverType == 1) {
			axios.get(`https://api.gatari.pw/users/get?u=${user}`)
				.then((res: any) => {
					if (res.data.users.length == 0) return reject(new Error( 'No user with the specified username/user id was found'));
					else return resolve(String(res.data.users[0].id));
				}).catch((err : Error) => {error.unexpectedError(err, `While running checkUser() : ${user} : ${serverType}`);});
		} else if (serverType == 2) {
			axios.get(`https://akatsuki.pw/api/v1/users?name=${user}`)
				.then((res: any) => {
					if (res.data.code == 404) return reject(new Error( 'No user with the specified username/user id was found'));
					else return resolve(String(res.data.id));
				}).catch(() => {reject(new Error( 'No user with the specified username/user id was found'));});
		} else {
			return reject(new Error('Invalid server type'));
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

export function arrayBasedSorting(array : Array<any>, order : Array<any>, key : string) {

	array.sort((a : any, b : any) => {
		var A = a[key];
		var B = b[key];

		if (order.indexOf(A) > order.indexOf(B)) {
			return 1;
		} else {
			return -1;
		}
	});

	return array;
	
}