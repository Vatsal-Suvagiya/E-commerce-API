
const config = require('config')
const mongoose = require('mongoose')
const Joi = require('joi')
 Joi.ObjectId = require('joi-objectid')(Joi);
const users = require('./routes/users')
const sellers = require('./routes/sellers')


const express = require('express')
const app = express()

try{
if(!config.get('jwtPrivateKey')) {
    console.error('Fatal error: jwtPrivatKey is not defined!')
    process.exit(1)
}

mongoose.connect('mongodb://localhost/shops')
    .then(()=>console.log("Connected to mongo.."))
    .catch(err=> console.error('could not connect to mongo..'))

    app.use(express.json())
    app.use('/users',users)
    app.use('/sellers',sellers)
    
    const port = process.env.PORT || 3000
    app.listen(port , ()=>console.log(`listening on port ${port}...`))
}
catch(ex)
{
    console.error("somthing is wrong...")
    
}
