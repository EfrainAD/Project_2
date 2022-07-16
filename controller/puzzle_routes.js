const express = require('express')
const router = express.Router()
const Puzzle = require('../models/puzzle')
const Collection = require('../models/collection')

// DELETE - Delete
router.delete('/delete/:id', (req, res) => {
    const PuzzleId = req.params.id

    Puzzle.findByIdAndRemove(PuzzleId)
        .then(puzzle => {
            res.redirect('/collections')
        })
        .catch(err => {
            res.json(err)
        })
})

router.get('/index', (req, res) => {
    Puzzle.find({})
        .then(puzzle => {
            res.render('puzzle/tempIndex', {puzzle})
        })
        .catch(console.error)
})
//Page: One Problem to look at.
router.get('/:puzzleId', (req, res) => {
    const puzzleId = req.params.puzzleId
    Puzzle.findById(puzzleId)
    .populate('owner','username')
    .populate('collections','name')
    .then(puzzle => {
        if ((puzzle.public === true) || (puzzle.owner.id == req.session.userId) )  {
            console.log('This is req.session: ',req.session)
            console.log('This is req.session.userId: ',req.session.userId)
            console.log('This is puzzle.owner.id: ',puzzle.owner.id)
            res.render('puzzle/show', {puzzle})
        }
        else {
            res.render('user/accessDenied')
        }
    })
})

// GET
router.get('/:collectionId/new', (req, res) => {
    console.log(`NOTE: ${req.session.username} ${req.session.loggedIn}`)
    const username = req.session.username
    const loggedIn = req.session.loggedIn
    const collectionId = req.params.collectionId
    res.render('puzzle/new', { username, loggedIn, collectionId }) 
})

// POST - Create //Need to note this.
router.post('/', (req, res) => {
    // console.log('HI')
    const collectionId = req.body.collections
    console.log('collectionId: '+collectionId)
    
    req.body.owner = req.session.userId
    req.body.public = req.body.public === 'on'
    
    console.log('res.body: ', req.body)
    Puzzle.create(req.body)
        .then(puzzle => {
                console.log('Puzzle object created: ',puzzle)
                Collection.findById(collectionId)
                    .then(collection => {
                        collection.puzzle = (puzzle._id) //Doesn't seem care if I did the push. need test.
                        console.log('collection that puzzle should be added to ', collection)
                        res.redirect(`/collection/${collectionId}`)
                    })
        .catch(err => res.send(err))
        
    })
    .catch(err => res.send(err))
})

module.exports = router