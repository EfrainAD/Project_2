const express = require('express')
const router = express.Router()
const Collection = require('../models/collection')
const Puzzle = require('../models/puzzle')

// DELETE - Delete collection
// Find collection by Id and remove it 
// IF user is is the owner of collection
router.delete('/delete/:id', (req, res) => {
    const collectionId = req.params.id
    const userId = req.session.userId

    Collection.findById(collectionId)
    .populate('owner')
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
// Show all public collections. 
router.get('/', (req, res) => {
    const loggedIn = req.session.loggedIn

    Collection.find({public: true})
        .populate('owner', 'username') // Just pass the owner.username
        .then(collection => {
            res.render('collection/index', { collection, loggedIn })
        })
        .catch(err => {
            res.json(err)
        })
})

// GET Displays forum for new collection and Check autherized in liquid.
router.get('/new', (req, res) => {
    const username = req.session.username
    const loggedIn = req.session.loggedIn
    res.render('collection/new', { username, loggedIn }) 
})

// GET Displaying an update form for collection with information filled in.
router.get('/:id/edit', (req, res) => {
    const collectionId = req.params.id
    const {userId, loggedIn} = req.session
    
    Collection.findById(collectionId)
        .populate('owner')
        .then(collection => {
            if (collection.owner.id == userId) {
    const loggedIn = req.session.loggedIn
                res.render('collection/edit', { collection, loggedIn })
            } else {
                res.render('user/accessDenied')}
        })
        .catch(err => {
            res.json(err)
        })
})

// GET - Show one Collection with options on what to do with it.
router.get('/:id', async (req, res) => {
    const collectionId = req.params.id
    const {userId, loggedIn} = req.session

    Collection.findById(collectionId)
        .populate('puzzle') 
        .populate('owner')
        .then(collection => {
            if ((collection.public === true) || (collection.owner.id == userId) )  {
                res.render('collection/show', { collection, userId, loggedIn})
            }
            else {
                res.render('user/accessDenied')
            }
        })
        .catch(err => {
            res.json(err)
        })
})

// POST - Create a collection from the POST body passed from forum.
router.post('/', (req, res) => {
    req.body.owner = req.session.userId
    req.body.public = req.body.public === 'on'
    
    Collection.create(req.body)
        .then(collection => {
            res.redirect('/collection')
        })
        .catch(err => {
            res.json(err)
        })
})

// PUT - Update your collection  //NOT PAGE
router.put('/:id', (req, res) => {
    const collectionId = req.params.id
    const userId = req.session.userId
    req.body.public = req.body.public === 'on'

    Collection.findById(collectionId)
        .populate('owner')
        .then(collection => {
            // check authentification
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