const { default: mongoose } = require("mongoose");
const Joi = require('joi');
Joi.ObjectId = require('joi-objectid')(Joi);

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        trim : true,
        minlength : 2,
        maxlength : 255
    },
    price : {
        type : Number,
        maxlength : 255
    },
    discription : {
        type : String,
        minlength : 5 ,
        maxlength : 255,
        trim : true
    },
    quantity : {
        type: Number
    },
    sellerID : {
        type : mongoose.Schema.Types.ObjectID,
        
        ref:"Seller"
    }
})

const Product = mongoose.model('Product' , productSchema)
exports.Product = Product
exports.pvalidate = function productValidate(product)
{
    const Schema = Joi.object({
        name : Joi.string().min(2).max(255).required(),
        price : Joi.number().required(),
        discription : Joi.string().min(5).required(),
        quantity : Joi.number().min(1).required()
    })
    
    return Schema.validate(product)
}

