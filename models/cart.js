const Sequelize = require('sequelize');
const { INTEGER } = Sequelize;

const sequelize = require('../utils/database');

const Cart = sequelize.define('cart', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        pirmaryKey: true
    }
});

module.exports = Cart;
