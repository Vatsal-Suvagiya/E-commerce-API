const { errorMonitor } = require('events')
const express = require('express')
const route = express.Router()
const _ = require('lodash')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, uvalidate } = require('../models/user')
const { Cart } = require('../models/cart')

const { Product } = require('../models/product')
const { userauth } = require('../middleware/auth')

route.post('/', async (req, res) => {
    console.log("run");
    const { error } = uvalidate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send("user already registerd.")

    user = new User(_.pick(req.body, ['name', 'email', 'password']))
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
   await  user.save()

    const token = user.generateAuthToken()
    res.header('x-auth-token', token).send(user)

})

route.post('/login', async (req, res) => {   

    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send("invalid email or password..")

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('invalid email or password')

    const token = user.generateAuthToken();

    res.header('x-auth-token', token).send("user login succesfully")

})

route.get('/me', userauth, (req, res) => {
    

    res.send(req.user)

})

route.get('/logout', userauth, (req, res) => {

    res.header('x-auth-token', null).send("successfully logout...")

})

route.get('/products', userauth, async (req, res) => {
    const products = await Product.find()
    res.send(products)
})

route.get('/products/:name', userauth, async (req, res) => {

    const product = await Product.findOne({ name: req.body.name })
    if (!product) return res.status(404).send('product does not found...')

    res.send(product)
})

route.post('/carts', userauth, async (req, res) => {

    try {
        let cart=  await Cart.findOne({ProductID : req.body.ProductID})
        const product = await Product.findById({ _id: req.body.ProductID })
        if (!product) return res.status(400).send("product do not exist..")
        if(cart) {
            
            cart.quantity += req.body.quantity
            product.quantity -= req.body.quantity
            
            await cart.save()
            return res.send(_.pick(cart, ['productID', 'quantity']))
        }    

        cart = new Cart({ ...req.body, userId: req.user._id })
        console.log(cart);

        if (cart.quantity <= 0) return res.status(401).send("enter valid quantity")
        product.quantity = product.quantity - cart.quantity

        if (product.quantity < 0) return res.status(401).send("enter valid quantity")
        console.log(product.quantity);
        
        product.save()
        cart.save()

        res.send(_.pick(cart, ['productID', 'quantity']))
    } catch (ex) { console.error('dk') }
})

route.delete('/carts/:cid', userauth, async (req, res) => {

    const cart = await Cart.findById({ _id: req.params.cid })
    if (!cart) return res.status(400).send("cart do not exist..")

   
    const product = await Product.findById({ _id: cart.ProductID})

    console.log(product);
    product.quantity = product.quantity + cart.quantity

    product.save()
    console.log(product.quantity);
    cart.remove()
    res.send(cart)
})
route.put('/carts/:cid',userauth,async(req,res)=>{
    try{
        let cart = await Cart.findById({ _id: req.params.cid })
        if (!cart) return res.status(400).send("cart do not exist..")
        let oldq = cart.quantity

        const cart1 = await Cart.findByIdAndUpdate({_id : req.params.cid } , req.body , {new:true})
        if(!cart1) return res.status(400).send('carts not found')

        const product = await Product.findById({ _id: cart1.ProductID})
        console.log(product.quantity);
        console.log(cart1.quantity);
        console.log(oldq);
        product.quantity = product.quantity - (cart1.quantity - oldq)
        await product.save()
        console.log(product.quantity);
        res.send("cart updated.. ..")
    }
    catch(ex){
        console.log("ex");
    }


})

module.exports = route; 