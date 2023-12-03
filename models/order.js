const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('Order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    date:{
        type:Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },    
    paymentid: {
        type: Sequelize.STRING(),
        allowNull: true
    },
    orderid:{
        type: Sequelize.STRING(),
        allowNull :false
    },
    status:{
        type: Sequelize.STRING(),
        defaultValue:"pending",
    }},
    {
        timestamps: false
    });

module.exports = Order;
