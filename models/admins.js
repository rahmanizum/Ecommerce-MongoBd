const { getDb } = require('../util/database')
const { ObjectId } = require('mongodb');
class Admin {
    constructor(name, email, phonenumber, password) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phonenumber;
        this.password = password;
    }
    save() {
        const db = getDb();
        return db.collection('admin').insertOne(this);
    }
    static fetchAdmin(email) {
        const db = getDb();
        return db.collection('admin').findOne({ email });
    }
    static fetchById(_id){
        const db = getDb();
        return db.collection('admin').findOne({ _id: new ObjectId(_id) });
    }
}


module.exports = Admin;