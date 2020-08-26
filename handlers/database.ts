/* eslint-disable no-unused-vars */
import { IDBDocument } from './interfaces';
import * as cache from './cache';

require('dotenv').config({
	path: '../.env'
});
const MongoClient = require('mongodb').MongoClient;
const dbName = 'thebeautifulbot';

// Options:
// - useCache : whether to read and update cache or not
// - noLogs : whether to show the logs or not

export function read(collectionName: string, findObject: IDBDocument, {useCache = true, noLogs = false} , callback: (results: Array<IDBDocument>, err: any) => void = (): void => { }): void {
	cache.get(collectionName).then((cacheData) => {
		if (useCache && cacheData != undefined) {
			// Filter
			for (var i = 0; i < Object.keys(findObject).length; i++) {
				cacheData = cacheData.filter((x: any) => x[Object.keys(findObject)[i]] == Object.values(findObject)[i]);
			}

			callback(cacheData, undefined);
			if (!noLogs) console.log(`READ (CACHE) : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
		} else {
			MongoClient.connect(process.env.dbURI, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			}, function (err: any, client: any) {
				if (err) {
					callback([], err);
					if (!noLogs) console.log(`FAILED TO READ :  ${cacheData[0]._id}`);
					return;
				}
				const db = client.db(dbName);

				const collection = db.collection(collectionName);

				collection.find(findObject).toArray(function (err: any, docs: Array<any>) {
					if (err) {
						callback([], err);

						if (!noLogs) console.log(`FAILED TO READ : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
						return;
					}

					if (docs.length == 0) {
						if (!noLogs) console.log(`READ (NO DOCUMENTS FOUND) : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
						callback([], undefined);
						return;
					}
					if (!noLogs) console.log(`READ : ${docs[0]._id}`);
					callback(docs, null);
					client.close();
				});

			});
		}
	}).catch(err => {throw err;});
}

export function write(collectionName: string, writeObject: IDBDocument, {useCache = true, noLogs = false}, callback: (results: Array<IDBDocument>, err: any) => void = (): void => { }): void {
	MongoClient.connect(process.env.dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, function (err: any, client: any) {

		if (err) {
			if (!noLogs) console.log(`FAILED TO WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
			callback([], err);
			return;
		}

		const db = client.db(dbName);

		const collection = db.collection(collectionName);

		collection.insertOne(writeObject, function (err: any, result: any) {
			if (err) {
				if (!noLogs) console.log(`FAILED TO WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
				callback([], err);
				return;
			}
			if (!noLogs) console.log(`WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
			callback([], null);
			client.close();
			// Append writeObject to cache
			if (useCache) {
				cache.get(collectionName).then((data) => {
					data.push(writeObject);
					cache.set(collectionName, data).then(() => {
						if (!noLogs) console.log(`WRITE (CACHE) : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
					}).catch((err) => { throw err; });
				}).catch((err) => { throw err; });
			}
		});

	});
}

export function update(collectionName: string, findObject: IDBDocument, setObject: IDBDocument, {useCache = true, noLogs = false, unset = false}, callback: (results: Array<IDBDocument>, err: any) => void = (): void => { }): void {
	MongoClient.connect(process.env.dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, function (err: any, client: any) {
		if (err) {
			if (!noLogs) console.log(`FAILED TO UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
			callback([], err);
			return;
		}
		const db = client.db(dbName);

		const collection = db.collection(collectionName);

		var updateOperation : any = {
			$set: setObject
		};

		if (unset) {
			updateOperation = {
				$unset: setObject
			};
		}

		collection.updateOne(findObject, updateOperation, function (err: any, result: any) {
			if (err) {
				if (!noLogs) console.log(`FAILED TO UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				callback([], err);
				return;
			}
			if (!noLogs) console.log(`UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
			callback([], null);
			client.close();

			// Filter and update cache
			if (useCache) {
				cache.get(collectionName).then((data) => {
					// Finding the index of the first object that matches findObject

					var index = data.findIndex((x: any) => {
						for (var i = 0; i < Object.keys(findObject).length; i++) {
							if (x[Object.keys(findObject)[i]] != Object.values(findObject)[i]) return false;
						}
						return true;
					});

					// Updating the object using setObject
					for (var i = 0; i < Object.keys(setObject).length; i++) {
						data[index][Object.keys(setObject)[i]] = Object.values(setObject)[i];
					}

					cache.set(collectionName, data).then(() => {
						if (!noLogs) console.log(`UPDATE (CACHE) : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
					}).catch((err) => { throw err; });
				}).catch((err) => { throw err; });
			}
		});
	});
}
