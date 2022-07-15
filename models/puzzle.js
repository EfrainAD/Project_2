// What will be needed.
const mongoose = require('./connection')
const { Schema, model } = mongoose

const puzzleSchema = new Schema(
	{
		owner: {
               type: Schema.Types.ObjectId,
			ref: 'User', 
               required: true
          },
          collections: [{
               type: Schema.Types.ObjectId, 
			ref: 'Collection'
               // default: 'none'
          }],
          public: {
               type: Boolean,
               default: false
          },
          // //This is the object
          problem: {
               type: String,
               required: true
          }
	},
	{
		timestamps: true,
	}
)

const Puzzle = model('Puzzle', puzzleSchema)

module.exports = Puzzle