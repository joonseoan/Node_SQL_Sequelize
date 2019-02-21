const Sequelize = require('sequelize');

const { INTEGER, STRING } = Sequelize;

const sequelize = require('../utils/database');

module.exports = sequelize.define('user', {
    
    id: {

        type: INTEGER,
        autoIncrement: true,
        allowNull : false,
        primaryKey: true

    },
    
    name: {
        type: STRING,
        allowNull: false
    },

    email: {
        type: STRING,
        allowNull: false
    }
   
});

