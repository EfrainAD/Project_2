require('dotenv').config()
const mongoose = require('mongoose')

// Adding this secion for Deployment.
// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })

// mongoose.connection.on('connected', () => {
//     console.log(`Mongoose connected to ${mongoose.connection.host}:${mongoose.connection.port}`);
//   });
  
//   mongoose.connection.on("error", (err) => {
//     console.log("Could not connect to MongoDB!", err);
//   });

// END adding this section for Deployment.

const DATABASE_URI = process.env.DATABASE_URI
const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// Commenented this section out when DEPLOYING
// connecting our mongoDB to mongoose
mongoose.connect(DATABASE_URI, config)

mongoose.connection
     .on('open', () => console.log('Connected to Mongoose'))
     .on('close', () => console.log('Disconnected from Mongoose'))
     .on('error', err => console.error(err))
// END OF DEPLOYMENT
module.exports = mongoose