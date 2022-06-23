const express = require('express')
const route = express.Router()
const _ = require('lodash')
const bcrypt = require('bcrypt')
const { Seller, svalidate } = require('../models/seller')
const { Product, pvalidate } = require('../models/product')
const { sellerauth } = require('../middleware/auth')

route.post('/', async (req, res) => {

    const { error } = svalidate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let seller = await Seller.findOne({ email: req.body.email })
    if (seller) return res.status(400).send("seller is already exist...")

    seller = new Seller(_.pick(req.body, ['name', 'email', 'password']))
    const salt = await bcrypt.genSalt(10)
    seller.password = await bcrypt.hash(req.body.password, salt)
    await seller.save()

    const token = seller.generateAuthToken()
    res.header('x-auth-token', token).send(seller)

})


route.post('/login', async (req, res) => {

    const seller = await Seller.findOne({ email: req.body.email })
    if (!seller) return res.status(400).send('invalid email or password')

    const validPassword = await bcrypt.compare(req.body.password, seller.password)
    if (!validPassword) return res.status(400).send('invalid email or password')

    const token = seller.generateAuthToken()

    res.header('x-auth-token', token).send("success..")

})
route.get('/me', sellerauth, async (req, res) => {
    res.send(req.seller)

})

route.get('/logout', sellerauth, (req, res) => {

    res.header('x-auth-token', null).send("successfully logout...")
})

route.post('/products', sellerauth, async (req, res) => {
    try{
       
    const { error } = pvalidate(req.body)
    if (error) return res.status(400).send(error.details[0].message)
        
    let product = new Product({...req.body, sellerID: req.seller._id })
    product = await product.save()
    
    console.log(product);
    res.send(_.pick(product,['name','price','discription','quantity','sellerID']))
    }
    catch(ex){
        console.log("somthing is wrong...");
    }
})


route.put('/products/:id', sellerauth, async (req, res) => {
    try{
    const { error } = pvalidate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let product =await Product.findByIdAndUpdate({ _id: req.params.id, sellerID: req.seller._id }, req.body, { new: true })
    if (!product) return res.status(404).send('product not found...')

    res.send(product)
    }
    catch(ex){console.error("error...")}
})

route.delete('/products/:id', sellerauth, async (req, res) => {
    const product = await Product.findOneAndRemove({ _id: req.params.id, sellerId: req.seller._id });

    if (!product) return res.status(404).send('The product with the given ID was not found.');

    res.send('product deleted..');
});
module.exports = route
