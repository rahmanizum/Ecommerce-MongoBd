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
}

module.exports=Customer;