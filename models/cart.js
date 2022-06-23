const Joi = require("joi");
const { default: mongoose } = require("mongoose");
Joi.ObjectId = require('joi-objectid')(Joi);

const cartSchema = new mongoose.Schema({
    userID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    ProductID:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Product"
    },
    quantity : {
        type : Number
    }
})

function Cvalidate(cart)
{
    const Schema = Joi.object({
        ProductID: Joi.objectId()
    })
    return Schema.validate(cart)
}
const Cart = mongoose.model('Cart', cartSchema)
exports.Cart = Cart