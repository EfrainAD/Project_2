// What will be needed.
const mongoose = require('./connection')
const { Schema, model } = mongoose

const collectionSchema = new Schema(
	{
		owner: {
               type: Schema.Types.ObjectId, 
			ref: 'User', 
               required: true
          },
          public: {
               type: Boolean,
               default: false
          },
          puzzle: [{ //DEBUG NOTE: Not sure if ref need be Puzzle.
               type: Schema.Types.ObjectId, 
               ref: 'Puzzle', 
          }]
	},
	{
		timestamps: true,
	}
)

const Collection = model('Collection', collectionSchema)

module.exports = Collection