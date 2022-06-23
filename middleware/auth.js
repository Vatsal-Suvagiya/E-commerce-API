const jwt = require('jsonwebtoken')
const config = require('config')
const { Seller } = require('../models/seller')
const { User} = require('../models/user')

exports.userauth = async function (req, res, next) {
    const token = req.header('x-auth-token')
    if (!token || token === "null")
        return res.status(401).send('User not found....')

    try {
        const decode = jwt.verify(token, config.get('jwtPrivateKey'))
        let user = await User.findById(decode._id)
        if (!user)
            return res.status(404).send('user not found..')

        req.user = user
        next()
    }
    catch(ex) {
        console.error('wrong...')
    }
}

exports.sellerauth = async function (req, res, next) {
    try {   
    const token = req.header('x-auth-token')
    if (!token || token === "null")
        return res.status(401).send('Seller not found...')

    
        const decode = jwt.verify(token, config.get('jwtPrivateKey'))
        let seller = await Seller.findById(decode._id)

        if (!seller)
            return res.status(404).send('seller not found..')

        req.seller = seller
        next()
    }
    catch(ex) {
        console.error('wrong..')
    }
}

