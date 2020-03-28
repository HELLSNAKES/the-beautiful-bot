/* eslint-disable no-unused-vars */
require('dotenv').config({
	path: '../.env'
});
const MongoClient = require('mongodb').MongoClient;

const dbName = 'thebeautifulbot';

function read(collectionName, findObject, callback = () => {}) {
	MongoClient.connect(process.env.dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, function (err, client) {
		if (err) {
			callback({}, err);
			console.log(`FAILED TO READ : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
			return;
		}
		const db = client.db(dbName);

		const collection = db.collection(collectionName);

		collection.find(findObject).toArray(function (err, docs) {
			if (err) {
				callback({}, error);
				console.log(`FAILED TO READ : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				return;
			}

			if (docs.length == 0) {
				console.log(`FAILED TO READ : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				callback({}, null);
				return;
			}
			console.log(`READ : ${docs[0]._id}`);
			callback(docs, null);
			client.close();
		});

	});
}

function write(collectionName, writeObject, callback) {
	MongoClient.connect(process.env.dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, function (err, client) {

		if (err) {
			console.log(`FAILED TO WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
			callback({}, err);
			return;
		}

		const db = client.db(dbName);

		const collection = db.collection(collectionName);

		collection.insertOne(writeObject, function (err, result) {
			if (err) {
				console.log(`FAILED TO WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
				callback({}, err);
				return;
			}
			console.log(`WRITE : { ${Object.keys(writeObject)[0]} : ${Object.values(writeObject)[0]} }`);
			callback({}, null);
			client.close();
		});

	});
}

function update(collectionName, findObject, setObject, callback) {
	MongoClient.connect(process.env.dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, function (err, client) {
		if (err) {
			console.log(`FAILED TO UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
			callback({}, err);
			return;
		}
		const db = client.db(dbName);

		const collection = db.collection(collectionName);

		collection.updateOne(findObject, {
			$set: setObject
		}, function (err, result) {
			if (err) {
				console.log(`FAILED TO UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				callback({}, err);
				return;
			}
			console.log(`UPDATE : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
			callback({}, null);
			client.close();
		});

	});
}


module.exports = {
	read: read,
	write: write,
	update: update
};