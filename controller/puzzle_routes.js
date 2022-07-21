const express = require('express')
const router = express.Router()
const Puzzle = require('../models/puzzle')
const Collection = require('../models/collection')
const { route } = require('./collection_routes')

// DELETE - Delete question/answer
router.delete('/delete/:id', (req, res) => {
    const PuzzleId = req.params.id
    const userId = req.session.userId

    Puzzle.findById(PuzzleId)
    .populate('owner')
    .then(puzzle => {
        // check if autherized
        if (userId == puzzle.owner.id) {
            puzzle.remove()
            res.redirect('/collection')
        } else {
            res.render('user/accessDenied')
        }
    })
    .catch(err => {
        res.json(err)
    })
})

//Temp show all problems on DB
router.get('/index', (req, res) => {
    Puzzle.find({})
        .then(puzzle => {
            res.render('puzzle/tempIndex', {puzzle})
        })
        .catch(console.error)
})

//Page: Edit forum
router.get('/:puzzleId/edit', (req, res) => {
    const puzzleId = req.params.puzzleId
    const ownerId = req.session.userId
    
    Puzzle.findById(puzzleId)
    .populate('owner')
    .then(puzzle => {
        if (ownerId == puzzle.owner.id) {
            res.render('puzzle/edit', {puzzle})
        } else {
            res.render('user/accessDenied')
        }
    })
})

//NOTPage: Edit the puzzle
router.put('/:puzzleId', (req, res) => {
    const userId = req.session.userId
    const puzzleId = req.params.puzzleId
    req.body.public = req.body.public === 'on'
    
    Puzzle.findById(puzzleId)
    .populate('owner')
    .then(puzzle => {
        // Check Atherized
        // If not render a page and everything under deosn't matter.
        // if passed move to the redirect.
        if (userId == puzzle.owner.id) {
        } else {
            res.render('user/accessDenied')
        }
    })
    Puzzle.findByIdAndUpdate(puzzleId, req.body, { new: true })
    .then(puzzle => {res.redirect( `/puzzle/${puzzleId}`)})
})

//Page: One Problem to look at.
router.get('/:puzzleId', (req, res) => {
    const puzzleId = req.params.puzzleId
    
    Puzzle.findById(puzzleId)
    .populate('owner','username')
    .populate('collections','name')
    .then(puzzle => {
        if ((puzzle.public === true) || (puzzle.owner.id == req.session.userId) )  {
            res.render('puzzle/show', {puzzle})
        }
        else {
            res.render('user/accessDenied')
        }
    })
})

// GET form page to create a new puzzle 
// ADD MORE NOTES HERES.
router.get('/:collectionId/new', (req, res) => {
    const username = req.session.username
    const loggedIn = req.session.loggedIn
    const collectionId = req.params.collectionId
    
    res.render('puzzle/new', { username, loggedIn, collectionId }) 
})

// Create puzzle // NOT A PAGE
router.post('/', async (req, res) => {
    const collectionId = req.body.collections
    console.log('collectionId: '+collectionId)
    
    // The body for the creation
    req.body.owner = req.session.userId
    req.body.public = req.body.public === 'on'
    
    // create the puzzle
    const newPuzzle = await Puzzle.create(req.body)
    console.log('New puzzle just created: ', newPuzzle)
    
    // Collcetion it's being made for needs to be updated to point to it.
    const updatedCollection = await Collection.findByIdAndUpdate(collectionId,{$push: {puzzle: [newPuzzle.id]}}, {new: true})
    console.log('Updated Collection returned is: ', updatedCollection)
    
    res.redirect(`/collection/${collectionId}`)
})

module.exports = router