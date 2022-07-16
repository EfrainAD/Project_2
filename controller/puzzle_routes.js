const express = require('express')
const router = express.Router()
const Puzzle = require('../models/puzzle')
const Collection = require('../models/collection')
const { route } = require('./collection_routes')

// DELETE - Delete
router.delete('/delete/:id', (req, res) => {
    const PuzzleId = req.params.id
    const userId = req.session.userId

    Puzzle.findById(PuzzleId)
    .populate('owner')
    .then(puzzle => {
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
        // console.log('I am printing Puzzle: ', puzzle)
        console.log('puzzle.owner.id: ', puzzle.owner.id)
        console.log('ownerId: ', ownerId)
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
        console.log('req.body: ', req.body)
        console.log('HI')
        if (userId == puzzle.owner.id) {
        } else {
            res.render('user/accessDenied')
        }
    })
    Puzzle.findByIdAndUpdate(puzzleId, req.body, { new: true })
    .then(puzzle => {res.redirect( `/puzzle/${puzzleId}`)})
    
    
})

// //TAKE ONE, NEXT TAKE
// router.put('/:puzzleId', (req, res) => {
//     const userId = req.session.userId
//     const puzzleId = req.params.puzzleId
//     req.body.public = req.body.public === 'on'
//     console.log('HI')
//     Puzzle.findById(puzzleId)
//     .populate('owner')
//     .then(puzzle => {
//         console.log('req.body: ', req.body)
//         console.log('HI')
//         if (userId == puzzle.owner.id) {
//             Puzzle.findByIdAndUpdate(puzzleId, req.body, { new: true })
//             console.log(puzzleId)
            
//             // Puzzle.findByIdAndUpdate(puzzleId, req.body, { new: true })
//             res.redirect(`/puzzle/${puzzleId}`)
//         } else {
//             res.render('user/accessDenied')
//         }
//     })
// })
/////trash under
// router.put('/:id', (req, res) => {
//     const puzzleId = req.params.id
//     const userId = req.session.userId
//     req.body.public = req.body.public === 'on'

//     Puzzle.findById(puzzleId)
//         .populate('owner')
//         .then(collection => {
//             if (userId == collection.owner.id) {
//                 console.log('HI in if')
//                 collection.set(req.body)
//                 collection.save()
//                 // collection.update(req.body)
//                 // Puzzle.findByIdAndUpdate(puzzleId, req.body, { new: true })
//                 console.log('HI')
                
//                 res.redirect(`/puzzle/${puzzle._id}`)
//             } else {
//                 res.render('user/accessDenied')
//             }
//         })
//         .catch(err => {
//             res.json(err)
//         })
// })
///////Trash above

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

// GET form page to create a new puzzle 
router.get('/:collectionId/new', (req, res) => {
    console.log(`NOTE: ${req.session.username} ${req.session.loggedIn}`)
    const username = req.session.username
    const loggedIn = req.session.loggedIn
    const collectionId = req.params.collectionId
    res.render('puzzle/new', { username, loggedIn, collectionId }) 
})

// Create puzzle // NOT A PAGE
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