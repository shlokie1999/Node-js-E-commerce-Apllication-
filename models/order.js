const {Schema,model} = require('mongoose');


const orderSchema = new Schema({
    products:[{
        product:{type:Object,required:true},
        quantity:{type:Number,required:true}
    }],
    user:{
        email:{
            type:String,
            required:true
        },
        userId:{
            type:Schema.Types.ObjectID,
            required:true,
            ref:'User'
        }
    },
    orderTotal:{
        type:Number,
        required:true
    }
})

// orderSchema.methods.createOrder = function(req){
   

    
// }

module.exports = model('Order',orderSchema)