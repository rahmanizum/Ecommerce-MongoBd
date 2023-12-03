const { getDb } = require('../util/database')
const { ObjectId } = require('mongodb');
class Admin {
    constructor(name, email, phonenumber, password) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phonenumber;
        this.password = password;
        this.forgotPassword = {};
    }
    save() {
        const db = getDb();
        return db.collection('admin').insertOne(this);
    }
    static fetchByEmail(email) {
        const db = getDb();
        return db.collection('admin').findOne({ email });
    }
    static fetchById(_id) {
        const db = getDb();
        return db.collection('admin').findOne({ _id: new ObjectId(_id) });
    }
    static createForgotPassword(_id, obj) {
        const db = getDb();
        return db.collection('admin').updateOne({ _id }, { $set: { "forgotPassword": obj } })
    }
    static updateForgotPassword(_id, obj) {
        const db = getDb();
        return db.collection('admin').updateOne({ _id }, { $set: { "forgotPassword": obj } })
    }
    static updatePassword(_id, password) {
        const db = getDb();
        return db.collection('admin').updateOne({ _id }, { $set: { "password": password } })
    }
    static fetchByForgotId(forgotId) {
        const db = getDb();
        return db.collection('admin').findOne({ "forgotPassword.forgotId": forgotId });
    }
    

}


module.exports = Admin;