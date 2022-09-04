const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
    MongoClient.connect('mongodb+srv://farhan:e7dAU6DHAmyyktuv@cluster0.bnacrmq.mongodb.net/shop?retryWrites=true&w=majority')
        .then((client) => {
            console.log('connect')
            _db = client.db();
            cb();
           
        }).catch((err) => {
            console.log(err)
        })

}

const getDB = ()=>{
    if(_db)
        return _db;
    throw new Error("not avaliable")
}

module.exports = {
    mongoConnect,
    getDB
}

