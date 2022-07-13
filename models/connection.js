require('dotenv').config()
const mongoose = require('mongoose')


const DATABASE_URI = process.env.DATABASE_URI
const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// connecting our mongoDB to mongoose
mongoose.connect(DATABASE_URI, config)

mongoose.connection
     .on('open', () => console.log('Connected to Mongoose'))
     .on('close', () => console.log('Disconnected from Mongoose'))
     .on('error', err => console.error(err))

module.exports = mongoose