const express = require('express')
const router = express.Router()
const Collection = require('../models/collection')

// DELETE - Delete
router.delete('delete/:id', (req, res) => {
    const collectionId = req.params.id

    Collection.findByIdAndRemove(collectionId)
        .then(collection => {
            res.redirect('/')
        })
        .catch(err => {
            res.json(err)
        })
})

// GET - Index
// localhost:8000/collection
router.get('/', (req, res) => {
    Collection.find({})
        .then(collection => {
            res.render('main/index', { collection })
        })
        .catch(err => {
            res.json(err)
        })
})

module.exports = router