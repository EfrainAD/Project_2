// What will be needed.
const mongoose = require('./connection')
const { Schema, model } = mongoose

const trackerSchema = new Schema({
     origin: {
          type: Schema.Types.ObjectId, 
          ref: 'Puzzle', 
          required: true
     }, 
     collections: [{
          type: Schema.Types.ObjectId, 
          ref: 'Collection'
     }],
     problem: {
          type: String,
          required: true
     },
     dueDate: {
          type: Date,
          repuired: true,
          default: Date.now()
	},
     dayJumper: {
          type: Number,
          required: true,
          default: 0
     }
     },{
          timestamps: true,
     }
)

const Tracker = model('Tracker', trackerSchema)

module.exports = Tracker
// module.exports = trackerSchema