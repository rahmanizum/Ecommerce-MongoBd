const { getDb } = require('../util/database');
const { ObjectId } = require('mongodb');
class Product{
    constructor(adminId,productName, productQuantity, productPrice, productDescription, imageUrl,id){
        this.adminId= adminId;
        this.productName = productName,
        this.productQuantity = productQuantity,
        this.productPrice = productPrice
        this.productDescription = productDescription,
        this.imageUrl = imageUrl;
        this._id= id ? new ObjectId(id):null;
    }
     save(){
        let db =  getDb();
        if(this._id){
            return db.collection('products').updateOne({_id: this._id },{$set:this})
        }else{
            return db.collection('products').insertOne(this);
        }

    }
    static fetchProducts(offset,limit,adminId){
        if(adminId){
            let db =  getDb();
            return db.collection('products')
            .find({adminId})
            .skip(Number(offset))
            .limit(Number(limit))
            .toArray();
        }else{
            let db =  getDb();
            return db.collection('products')
            .find()
            .skip(Number(offset))
            .limit(Number(limit))
            .toArray();
        }

    }
    static fetchProduct(_id){
        let db =  getDb();
        return db.collection('products').findOne({ _id: new ObjectId(_id) })
    }
    static deleteById(_id){
        let db = getDb();
        return db.collection('products').deleteOne({ _id: new ObjectId(_id) })
    }
}
module.exports = Product;