// database.js

const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_SCHEMA || 'csci5409',
    process.env.DB_USER || 'admin',
    process.env.DB_PASSWORD || '12345678',
    {
        host: process.env.DB_HOST || 'csci5409-part.c2vryhkngaoi.us-east-2.rds.amazonaws.com',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql'
    });
const part = sequelize.define('part', {
    part_no: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    part_desc: {
        type: Sequelize.STRING,
        allowNull: true
    },
});
module.exports = {
    sequelize: sequelize,
    part: part
};