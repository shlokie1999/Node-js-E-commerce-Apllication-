const getDb = require('../util/database').getDB;
const mongoDb = require('mongodb')

class Cart{
    constructor(prod,id){
        this.products = prod;
        this.userID = id;
        this.cartPrice = 0;
    };

    save(){
        const db = getDb();
        return db.collection('cart').insertOne(this);
    }

    static getUserCart(id){
        const db = getDb();
        return db.collection('cart').findOne({userID:mongoDb.ObjectId(id)})
    }

    static updateUserCart(cart){
        const db = getDb();
        return db.collection('cart').updateOne({_id:mongoDb.ObjectId(cart._id)},{$set:{products:cart.products,cartPrice:cart.cartPrice}})
    }
    
}

module.exports = Cart;