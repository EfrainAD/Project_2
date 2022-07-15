const express = require('express')
const router = express.Router()
const Puzzle = require('../models/puzzle')
const Collection = require('../models/collection')

// DELETE - Delete
// router.delete('/delete/:id', (req, res) => {
//     const PuzzleId = req.params.id

//     Puzzle.findByIdAndRemove(PuzzleId)
//         .then(puzzle => {
//             res.redirect('user')
//         })
//         .catch(err => {
//             res.json(err)
//         })
// })

// GET
router.get('/:collectionId/new', (req, res) => {
    console.log(`NOTE: ${req.session.username} ${req.session.loggedIn}`)
    const username = req.session.username
    const loggedIn = req.session.loggedIn
    const collectionId = req.params.collectionId
    res.render('puzzle/new', { username, loggedIn, collectionId }) 
})

// POST - Create
router.post('/', (req, res) => {
    // console.log('HI')
    const collectionId = req.body.collections
    console.log('collectionId: '+collectionId)
    
    req.body.owner = req.session.userId
    req.body.public = req.body.public === 'on'
    
    console.log('res.body: '+JSON.stringify(req.body))
    Puzzle.create(req.body)
        .then(puzzle => {
                console.log('Puzzle object created: '+puzzle)
                .then(puzzle => {
                    console.log('returned puzzle in the next .then '+puzzle )
                    Collection.findById(collectionId)
                        .then(collection => {
                            collection.puzzle = puzzle
                            console.log('collection that puzzle should be added to '+collection)
                            res.redirect(`/collection/${req.body.collection}`)
                        })
                        .catch(err => res.send(err))
        })
        .catch(err => res.send(err))
    })
    .catch(err => res.send(err))
})

module.exports = router