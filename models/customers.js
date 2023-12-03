const { getDb } = require('../util/database');
const { ObjectId } = require('mongodb');
class Customer {
    constructor(name,email,phonenumber,password,id){
        this.name = name;
        this.email = email;
        this.phonenumber = phonenumber;
        this.password = password;
        this._id= id ? new ObjectId(id):null;
        this.cart = {items:[]};
        this.order = {order_items:[]}
        this.forgotPassword = {};
    }
    save(){
        let db = getDb();
        return db.collection('customer').insertOne(this);
    }
    static fetchCustomer(email) {
        const db = getDb();
        return db.collection('customer').findOne({ email });
    }
    static fetchById(_id){
        const db = getDb();
        return db.collection('customer').findOne({ _id: new ObjectId(_id) });
    }
    static addtoCart(customerId,items){
        const db = getDb();
        return db.collection("customer")
        .updateOne({_id : new ObjectId(customerId)},{$set:{ "cart.items":items }});
    }
    static createOrder(customerId,order){
        const db = getDb();
        return db.collection("customer")
        .updateOne({_id : new ObjectId(customerId)},{$push:{ "order.order_items":order }});   
    }
    static getOrderById(ordr_id){
        const db = getDb();
        return db.collection("customer").findOne()
    }
    static updateOrder(customerId,orders){
        const db = getDb();
        return db.collection("customer")
        .updateOne({_id : new ObjectId(customerId)},{$set:{ "order.order_items":orders }});   
    }
    static createForgotPassword(_id, obj) {
        const db = getDb();
        return db.collection('customer').updateOne({ _id }, { $set: { "forgotPassword": obj } })
    }
    static updateForgotPassword(_id, obj) {
        const db = getDb();
        return db.collection('customer').updateOne({ _id }, { $set: { "forgotPassword": obj } })
    }
    static updatePassword(_id, password) {
        const db = getDb();
        return db.collection('customer').updateOne({ _id }, { $set: { "password": password } })
    }
    static fetchByForgotId(forgotId) {
        const db = getDb();
        return db.collection('customer').findOne({ "forgotPassword.forgotId": forgotId });
    }
}

module.exports=Customer;