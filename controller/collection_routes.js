const express = require('express')
const router = express.Router()
const Collection = require('../models/collection')
const Puzzle = require('../models/puzzle')

// DELETE - Delete
router.delete('/delete/:id', (req, res) => {
    const collectionId = req.params.id
    const userId = req.session.userId

    Collection.findById(collectionId)
    .then(collection => {
        if (collection.owner.id == userId) {
            collection.remove()
            res.redirect('/collection')
        } else {
            res.render('user/accessDenied')}
    })
    .catch(err => {
        res.json(err)
    })
})

// GET - Index
// localhost:8000/collection
router.get('/', (req, res) => {
    Collection.find({public: true})
        .populate('owner', 'username')
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
    const userId = req.session.userId
    
    Collection.findById(collectionId)
        .populate('owner')
        .then(collection => {
            const ownerId = collection.owner.id
            console.log('userId: ', userId)
            console.log('ownerId: ', ownerId)
            console.log('collection.owner.id: ', collection.owner.id)
            if (collection.owner.id == userId) {
                res.render('collection/edit', { collection })
            } else {
                res.render('user/accessDenied')}
        })
        .catch(err => {
            res.json(err)
        })
})

// GET - Show
// localhost:3000/fruits/:id <- change with the id being passed in
router.get('/:id', async (req, res) => {
    const collectionId = req.params.id
    const userId = req.session.userId
    const username = req.session.username
    const puzzle = await Puzzle.find({collections: collectionId, public: true})
    const puzzlePrivate = await Puzzle.find({collections: collectionId, public: false, owner: userId})

    Collection.findById(collectionId)
        // .populate('puzzle') //Not owrk Why????
        .populate('owner','username')
        // send back some json
        .then(collection => {
            // res.json(collection)

            if ((collection.public === true) || (collection.owner.id == userId) )  {
                console.log('This is req.session: ', req.session)
                console.log('This is userId: ', userId)
                console.log('This is collection.owner.id: ', collection.owner.id)
                res.render('collection/show', { collection, puzzle, puzzlePrivate, userId, username})
            }
            else {
                res.render('user/accessDenied')
            }

            
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
    const userId = req.session.userId
    req.body.public = req.body.public === 'on'

    Collection.findById(collectionId)
        .populate('owner')
        .then(collection => {
            if (userId == collection.owner.id) {
                collection.findByIdAndUpdate(collectionId, req.body, { new: true })
                res.redirect(`/collection/${collection._id}`)
            } else {
                res.render('user/accessDenied')
            }
        })
        .catch(err => {
            res.json(err)
        })
})

module.exports = router