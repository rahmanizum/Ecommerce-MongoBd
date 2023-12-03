const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const CartItem = sequelize.define('CartItem',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey:true
    },
    quantity:{
        type : Sequelize.INTEGER,
        allowNull: false
    }},
    {
        timestamps: false
    }
    );

module.exports=CartItem;
