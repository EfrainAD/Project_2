// What will be needed.
const mongoose = require('./connection')
const { Schema, model } = mongoose

const trackerSchema = new Schema(
	{
		puzzle: {
               type: Schema.Types.ObjectId, 
			ref: 'Puzzle', 
               required: true
          },
          dueDate: {
               type: Date
               //Add defult later.
          },
	},
	{
		timestamps: true,
	}
)

const Tracker = model('Tracker', trackerSchema)

module.exports = Tracker