// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;

// let _db;

// const mongoConnect = (callback) => {
//     MongoClient.connect('mongodb://localhost/kim-store').then(client => {
//         console.log('Connected');
//         _db = client.db();
//         callback();
//     }).catch(err => {
//         console.log(err);
//         throw err;
//     });
// }

// const getDb = () => {
//     if (_db) {
//         return _db;
//     }

//     throw 'No database found!';
// }

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;

// const Sequelize = require('sequelize');

// const sequelize = new Sequelize(
//     'kim-store', 
//     'root', 
//     'kimstore', 
//     { 
//         dialect: 'mysql',
//         host: 'localhost'
//     }
// );

// module.exports = sequelize;