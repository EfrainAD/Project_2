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

// GET route for displaying my form for create
router.get('/new', (req, res) => {
    console.log(`NOTE: ${req.session.username} ${req.session.loggedIn}`)
    const username = req.session.username
    const loggedIn = req.session.loggedIn
    res.render('main/new', { username, loggedIn })
})

// POST - Create
router.post('/', (req, res) => {
    req.body.public = req.body.public === 'on'

    req.body.owner = req.session.userId

    console.log(req.body)
    Collection.create(req.body)
        .then(collection => {
            console.log(collection)
            // res.json(fruit)
            res.redirect('/collection')
        })
        .catch(err => {
            res.json(err)
        })
})

module.exports = router