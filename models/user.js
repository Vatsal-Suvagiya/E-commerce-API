const mongoose = require("mongoose")
const Joi = require("joi")
const jwt = require('jsonWebToken')

const config = require("config")
const userSchema =new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        minlength : 5,
        maxlength : 255
    },
    email : {
        type : String,
        required : true , 
        minlength :5,
        maxlength : 255,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minlength : 5,
        maxlength : 1024,
    }
    
})

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id } , config.get('jwtPrivateKey'))
    return token
}

const User = mongoose.model('User',userSchema)

function uservalidate(user){
    const Schema = Joi.object({
        name : Joi.string().min(5).max(255).required(),
        email : Joi.string().min(5).max(255).email().required(),
        password : Joi.string().min(5).max(255).required()
    })
    return Schema.validate(user)
}

exports.User = User
exports.uvalidate = uservalidate