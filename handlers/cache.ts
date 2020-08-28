const fs = require('fs');
const path = require('path');

const cachePath = path.resolve(__dirname,'../cache/cache.json');
	
export function load(): Promise < any > {
	return new Promise((resolve, reject) => {
		fs.access(cachePath, fs.constants.F_OK, (err: Error) => {
			if (err) {

				if (!fs.existsSync(cachePath.slice(0, cachePath.lastIndexOf('/')))) {
					fs.mkdirSync('cache');
				}

				fs.appendFile(cachePath, JSON.stringify({}), (writeErr: Error) => {
					if (writeErr) return reject(writeErr);
					return resolve({});
				});
			} else {
				fs.readFile(cachePath, (readErr: Error, data: any) => {
					if (readErr) return reject(readErr);
					try {
						resolve(JSON.parse(data));
					} catch(err) {
						reject(err);
					}
				});
			}
		});
	});
}

export function save(data: any): Promise < any > {
	return new Promise((resolve, reject) => {
		fs.access(cachePath, fs.constants.F_OK, (err: Error) => {
			if (err) {

				if (!fs.existsSync(cachePath.slice(0, cachePath.lastIndexOf('/')))) {
					fs.mkdirSync('cache');
				}
				
				fs.appendFile(cachePath, JSON.stringify(data), (writeErr: Error) => {
					if (writeErr) return reject(writeErr);
					return resolve(data);
				});
			} else {
				fs.writeFile(cachePath, JSON.stringify(data), (writeErr: Error) => {
					if (writeErr) return reject(writeErr);
					return resolve(data);
				});
			}
		});
	});
}

export function set(setKey: string, setValue: any): Promise <any> {
	return new Promise((resolve, reject) => {
		load().then((data) => {
			data[setKey] = setValue;
			save(data).then(resolve).catch(reject);
		}).catch(reject);
	});
}

export function get(getKey : string) : Promise<any> {
	return new Promise((resolve, reject ) => {
		load().then((data) => {
			resolve(data[getKey]);
		}).catch(reject);
	});
}

export function flush() {
	return new Promise((resolve, reject) => {
		save({}).then(resolve).catch(reject);
	});
}

flush();