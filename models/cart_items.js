const Sequelize = require('sequelize');
const { INTEGER, STRING } = Sequelize;

const sequelize = require('../utils/database');

const CartItems = sequelize.define('cartItems', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        pirmaryKey: true
    },
    qty: INTEGER
});

module.exports = CartItems;