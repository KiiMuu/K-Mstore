const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'kim-store', 
    'root', 
    'kimstore', 
    { 
        dialect: 'mysql',
        host: 'localhost'
    }
);

module.exports = sequelize;

