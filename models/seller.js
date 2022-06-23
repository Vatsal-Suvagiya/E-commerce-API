const mongoose = require("mongoose")
const Joi = require("joi")
const jwt = require('jsonwebtoken')
const config = require('config')
const sellerSchema = new mongoose.Schema({
    name : {
         type : String,
         required : true,
         trim : true,
         minlength : 5,
         maxlength : 255
    },
    email : {
        type : String,
        required: true,
        minlength : 5,
        maxlength : 255,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minlength : 5,
        maxlength:1024
    },
})

sellerSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id : this.id } , config.get("jwtPrivateKey"))
    return token
}

const Seller = mongoose.model('Seller', sellerSchema)

function sellervalidate(seller){
    const schema = Joi.object({
        name : Joi.string().min(5).max(255).required(),
        email : Joi.string().min(5).max(255).email().required(),
        password : Joi.string().min(5).max(255).required()
    })

    return schema.validate(seller)
}

exports.Seller = Seller
exports.svalidate = sellervalidate