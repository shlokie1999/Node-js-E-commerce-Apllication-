const {Schema,model,Types} = require('mongoose');

const productSchema = new Schema({
    title:{
      type:String,
      required:true
    },
    price:{
      type:Number,
      required:true
    },
    description:{
      type:String,
      required:true
    },
    imageUrl:{
      type:String,
      required:true
    },
    creatorId:{
      type:Types.ObjectId,
      required:true
    }
})

module.exports = model('Product',productSchema);