const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    resetToken:String,
    resetTokenExpiration:Date,
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectID,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            productPrice: {
                type: Number,
                required: true
            }
        }],
        cartPrice: {
            type: Number,
            required: true
        }
    }

});

userSchema.methods.addToCart = function (req) {
    let indexOfProduct = this.cart.items.findIndex(item => item.productId == req.body.productId);
    if (indexOfProduct == -1) {
        this.cart.items.push({ productId: req.body.productId, quantity: 1, productPrice: +req.body.productPrice });
    } else {
        this.cart.items[indexOfProduct].quantity++;
    }
    this.cart.cartPrice += (+req.body.productPrice);
    return this.save();
}

userSchema.methods.removeFromCart = function (req) {
    let indexOfProduct = this.cart.items.findIndex(item => item.productId == req.body.productId);
    this.cart.cartPrice -= this.cart.items[indexOfProduct].productPrice * this.cart.items[indexOfProduct].quantity;
    this.cart.items.splice(indexOfProduct, 1);
    return this.save();
}

module.exports = model('User', userSchema);