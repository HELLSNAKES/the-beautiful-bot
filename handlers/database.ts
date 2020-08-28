/* eslint-disable no-unused-vars */
import { IDBDocument } from './interfaces';
import * as cache from './cache';
import { renameKey } from './utility';

require('dotenv').config({
	path: '../.env'
});
const MongoClient = require('mongodb').MongoClient;
const dbName = 'thebeautifulbot';

// Options:
// - useCache : whether to read and update cache or not
// - noLogs : whether to show the logs or not

export function read(collectionName: string, findObject: IDBDocument, { useCache = true, noLogs = false }): Promise<Array<IDBDocument>> {
	return new Promise((resolve, reject) => {
		cache.get(collectionName).then((cacheData) => {
			if (useCache && cacheData != undefined) {
				// Filter
				for (var i = 0; i < Object.keys(findObject).length; i++) {
					cacheData = cacheData.filter((x: any) => x[Object.keys(findObject)[i]] == Object.values(findObject)[i]);
				}

				if (!noLogs) console.log(`READ (CACHE) : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				return resolve(cacheData);
			} else {
				MongoClient.connect(process.env.dbURI, {
					useNewUrlParser: true,
					useUnifiedTopology: true
				}, (err: Error, client: any) => {
					if (err) {
						if (!noLogs) console.log(`FAILED TO READ :  ${cacheData[0]._id}`);
						return reject(err);
					}

					const db = client.db(dbName);
					const collection = db.collection(collectionName);

					collection.find(findObject).toArray((err: Error, docs: Array<any>) => {
						if (err) {
							if (!noLogs) console.log(`FAILED TO READ : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
							return reject(err);
						}

						if (docs.length == 0) {
							if (!noLogs) console.log(`READ (NO DOCUMENTS FOUND) : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
							return resolve([]);
						}

						if (!noLogs) console.log(`READ : ${docs[0]._id}`);
						client.close();
						return resolve(docs);
					});
				});
			}
		}).catch(reject);
	});
}

export function write(collectionName: string, writeObject: IDBDocument, { useCache = true, noLogs = false }): Promise<Array<IDBDocument>> {
	return new Promise((resolve, reject) => {
		MongoClient.connect(process.env.dbURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}, (err: Error, client: any) => {
			if (err) {
				if (!noLogs) console.log(`FAILED TO WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
				return reject(err);
			}

			const db = client.db(dbName);
			const collection = db.collection(collectionName);

			collection.insertOne(writeObject, (err: Error, result: any) => {
				if (err) {
					if (!noLogs) console.log(`FAILED TO WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
					return reject(err);
				}

				if (!noLogs) console.log(`WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
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

				return resolve(result);
			});
		});
	});
}

export function update(collectionName: string, findObject: IDBDocument, setObject: IDBDocument, { useCache = true, noLogs = false, unset = false }): Promise<Array<IDBDocument>> {
	return new Promise((resolve, reject) => {
		MongoClient.connect(process.env.dbURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}, function (err: Error, client: any) {
			if (err) {
				if (!noLogs) console.log(`FAILED TO UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				return reject(err);
			}

			const db = client.db(dbName);
			const collection = db.collection(collectionName);

			var updateOperation: any = {
				$set: setObject
			};

			if (unset) updateOperation = renameKey(updateOperation, '$set', '$unset');

			collection.updateOne(findObject, updateOperation, function (err: Error, result: any) {
				if (err) {
					if (!noLogs) console.log(`FAILED TO UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
					return reject(err);
				}

				if (!noLogs) console.log(`UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				client.close();

				// Filter and update cache
				if (useCache) {
					cache.get(collectionName).then((data) => {

						// Finding the index of te hfirst object that matches findObject
						var index = data.findIndex((x: any) => {
							for (var i = 0; i < Object.keys(findObject).length; i++) {
								if (x[Object.keys(findObject)[i]] != Object.values(findObject)[i]) return false;
							}

							return true;
						});

						if (unset) {
							for (var i = 0; i < Object.keys(setObject).length; i++) {
								delete data[index][Object.keys(setObject)[i]];
							}

						} else {
							// Updating the object using setObject
							for (i = 0; i < Object.keys(setObject).length; i++) {
								data[index][Object.keys(setObject)[i]] = Object.values(setObject)[i];
							}
						}

						cache.set(collectionName, data).then(() => {
							if (!noLogs) console.log(`UPDATE (CACHE) : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
						}).catch(reject);
					}).catch(reject);
				}

				return resolve(result);
			});
		});
	});
}
