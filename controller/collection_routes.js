const express = require('express')
const router = express.Router()
const Collection = require('../models/collection')
const Puzzle = require('../models/puzzle')

// DELETE - Delete
router.delete('/delete/:id', (req, res) => {
    const collectionId = req.params.id

    Collection.findByIdAndRemove(collectionId)
        .then(collection => {
            res.redirect('/collection')
        })
        .catch(err => {
            res.json(err)
        })
})

// GET - Index
// localhost:8000/collection
router.get('/', (req, res) => {
    Collection.find({public: true})
        .then(collection => {
            res.render('collection/index', { collection })
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
    res.render('collection/new', { username, loggedIn }) 
})

// GET route for displaying an update form
router.get('/:id/edit', (req, res) => {
    const collectionId = req.params.id

    Collection.findById(collectionId)
        .then(collection => {
            res.render('collection/edit', { collection })
        })
        .catch(err => {
            res.json(err)
        })
})

// GET - Show
// localhost:3000/fruits/:id <- change with the id being passed in
router.get('/:id', async (req, res) => {
    const collectionId = req.params.id
    const puzzle = await Puzzle.find({collections: collectionId})

    Collection.findById(collectionId)
        // .populate('puzzle') //Not owrk Why????
        .populate('owner', 'username')
        // send back some json
        .then(collection => {
            // res.json(collection)
            const userId = req.session.userId
            const username = req.session.username
            res.render('collection/show', { collection, puzzle, userId, username})
        })
        .catch(err => {
            res.json(err)
        })
})

// POST - Create
router.post('/', (req, res) => {
    
    req.body.owner = req.session.userId
    req.body.public = req.body.public === 'on'
    
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

// PUT - Update //NOT PAGE
// localhost:3000/fruits/:id
router.put('/:id', (req, res) => {
    const collectionId = req.params.id

    req.body.public = req.body.public === 'on'

    Collection.findByIdAndUpdate(collectionId, req.body, { new: true })
        .then(collection => {
            res.redirect(`/collection/${collection._id}`)
        })
        .catch(err => {
            res.json(err)
        })
})

module.exports = router