/* eslint-disable no-unused-vars */
'use strict';

import { IDBDocument } from './interfaces';

require('dotenv').config({
	path: '../.env'
});
const MongoClient = require('mongodb').MongoClient;

const dbName = 'thebeautifulbot';

export function read(collectionName: string, findObject: IDBDocument, callback: (results: Array<IDBDocument>, err: any) => void = (): void => { }): void {
	MongoClient.connect(process.env.dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, function (err: any, client: any) {
		if (err) {
			callback([], err);
			console.log(`FAILED TO READ : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
			return;
		}
		const db = client.db(dbName);

		const collection = db.collection(collectionName);

		collection.find(findObject).toArray(function (err: any, docs: Array<any>) {
			if (err) {
				callback([], err);

				console.log(`FAILED TO READ : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				return;
			}

			if (docs.length == 0) {
				console.log(`READ (NO DOCUMENTS FOUND) : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				callback([], undefined);
				return;
			}
			console.log(`READ : ${docs[0]._id}`);
			callback(docs, null);
			client.close();
		});

	});
}

export function write(collectionName: string, writeObject: IDBDocument, callback: (results: Array<IDBDocument>, err: any) => void = (): void => { }): void {
	MongoClient.connect(process.env.dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, function (err: any, client: any) {

		if (err) {
			console.log(`FAILED TO WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
			callback([], err);
			return;
		}

		const db = client.db(dbName);

		const collection = db.collection(collectionName);

		collection.insertOne(writeObject, function (err: any, result: any) {
			if (err) {
				console.log(`FAILED TO WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
				callback([], err);
				return;
			}
			console.log(`WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
			callback([], null);
			client.close();
		});

	});
}

export function update(collectionName: string, findObject: IDBDocument, setObject: IDBDocument, callback: (results: Array<IDBDocument>, err: any) => void = (): void => { }): void {
	MongoClient.connect(process.env.dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, function (err: any, client: any) {
		if (err) {
			console.log(`FAILED TO UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
			callback([], err);
			return;
		}
		const db = client.db(dbName);

		const collection = db.collection(collectionName);

		collection.updateOne(findObject, {
			$set: setObject
		}, function (err: any, result: any) {
			if (err) {
				console.log(`FAILED TO UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				callback([], err);
				return;
			}
			console.log(`UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
			callback([], null);
			client.close();
		});

	});
}
