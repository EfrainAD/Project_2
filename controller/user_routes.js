///////////////////////////////////////
// Import dependencies
///////////////////////////////////////
const express = require('express')
const User = require('../models/user')
const PersonalTracker = require('../models/personal-tracker')
const Collection = require('../models/collection')
const Puzzle = require('../models/puzzle')
// bcrypt is used to hash(read: encrypt) passwords
const bcrypt = require('bcryptjs')

///////////////////////////////////////
// Create a router
///////////////////////////////////////
const router = express.Router()

///////////////////////////////////////
// list out our routes
///////////////////////////////////////
// two sign up routes
// one GET to show the form
router.get('/signup', (req, res) => {
    res.render('user/login_signup')
})

// one POST to make the db request
router.post('/signup', async (req, res) => {
    console.log('this is our initial request body', req.body)
    // first, we need to encrypt our password
    // that's why we made this an async function
    // because the password hashing takes a little time, we want to wait until it's done before things progress
    // we need to wait for bcrypt to run its 'salt rounds' before continuing
    // salt rounds are like saying "encrypt this x amount of times before settling on one encryption"
    req.body.password = await bcrypt.hash(
        req.body.password,
        await bcrypt.genSalt(10)
    )

    // now that our password is hashed, we can create a user
    console.log('this is request body after hashing', req.body)
    User.create(req.body)
        // if created successfully, we'll redirect to the login page
        .then(user => {
            console.log('this is the new user', user)
            res.redirect('/user/login')
        })
        // if creation was unsuccessful, send the error
        .catch(error => {
            console.log(error)
            res.json(error)
        })
})

// two login routes
// one GET to show the form
router.get('/login', (req, res) => {
     res.render('user/login_signup')
})
// one POST to login and create the session
router.post('/login', async (req, res) => {
    // take a look at our req obj
    // console.log('this is the request object', req)
    // destructure data from request body
    const { username, password } = req.body
    // console.log('this is username', username)
    // console.log('this is password', password)
    console.log('this is the session', req.session)
    // first we find the user
    User.findOne({ username })
        .then(async (user) => { // ._id
            // we check if the user exists
            // if they do, we'll compare the passwords and make sure it's correct
            if (user) {
                // compare the pw
                // bcrypt.compare evaluates to a truthy or falsy value
                const result = await bcrypt.compare(password, user.password)

                if (result) {
                    // if the compare comes back truthy we store user properties in the session
                    // if the pw is correct, we'll use the newly created session object
                    req.session.username = username
                    req.session.loggedIn = true
                    req.session.userId = user._id
                    // redirect to the '/fruits' page
                    console.log('this is the session after login', req.session)
                    res.redirect('/main')
                } else {
                    // otherwise(pw incorrect) send an error message
                    // for now just send some json error
                    res.json({ error: 'username or password incorrect' })
                }
            } else {
                // send error if user doesn't exist
                res.json({ error: 'user does not exist' })
            }
        })
        // if they don't we'll redirect to the sign up page
        .catch(error => {
            console.log(error)
            res.json(error)
        })
})

// logout route
// can be a GET that calls destroy on our session
// we can add an 'are you sure' page if there is time
router.get('/logout', (req, res) => {
    // destroy the session and redirect to the main page
    req.session.destroy(ret => {
        console.log('this is returned from req.session.destroy', ret)
        console.log('session has been destroyed')
        console.log(req.session)
        res.redirect('/main')
    })
})

// Add a problems to your personal tracker. 
router.post('/tracker/:puzzleId', async (req, res) => {
    const userId = req.session.userId
    const puzzleId = req.params.puzzleId

    //  The user Doesn't select a collection, so it needs be added to a collection named none. Check if the user has one or if one needs be more for user.
    const userCollections = await Collection.find({owner: userId})
    let collectionToId = null // Id that collection have if it exist or made

    // check if collection 'none' already exist
    for (let i = 0; i < userCollections.length; i++) {
        if (userCollections[i].name === 'none')
            collectionToId = userCollections[i].id
    }
    // If doens not make a new one named 'none'.
    if (collectionToId === null) {
        const collectionTo = await Collection.create({
            owner: userId,
            name: 'none',
            puzzle: [puzzleId]
        })
        collectionToId = collectionTo.id
    }
    
    // Now we can focus on adding the puzzle to persoanl tracker and then attach it to the user.
    const puzzle = await Puzzle.findById(puzzleId)
   
    // This is body for personal tracker to be created
    const body = {
        origin: puzzle.id,
        collections: [collectionToId], 
        problem: puzzle.problem,
        answer: puzzle.answer,
        dueDate: Date.now(),
        dayJumper: 0
    }
    const newTracker = await PersonalTracker.create(body)

    // User personal tracker array needs updated with the new personal tracker
    userUpdated = await User.findByIdAndUpdate({_id: userId}, {$push: {personalTracker: newTracker.id}},{new: true})
    res.redirect('/user')
})

// Grab all puzzles from the collection and to personal counter.
router.post('/:collectionId', async (req, res) => {
    const puzzleSourceCollection = req.params.collectionId // Collection to get the problems
    const userId = req.session.userId               
    const newCollectionName = req.body.userCollection // Name of the collection to be made for the user if he already doesnt have it.(Comes from the forum.) 
    
    // Grab any collection the user has with the same name as "newCollectionName" that was gottone from req.body
    const collectionIfExists = await Collection.findOne({owner: userId, name: newCollectionName})
    
    // if user doesn't have a collection by that name, make one.
    if (!collectionIfExists) { 
        const newCollection = await Collection.create({owner: userId, name: newCollectionName})
        const collectionFrom = await Collection.findById(puzzleSourceCollection)
        .populate('owner')
        .populate('puzzle')
        
        // Check if aultherrized
        if ((collectionFrom.public === true) || (userId == collectionFrom.owner.id) ) {
            // Grab all puzzles from the collection and update to the new colleciton
            for (let i = 0; i < collectionFrom.puzzle.length; i++) {
                if (collectionFrom.puzzle[i].public) {                  
                    Collection.findByIdAndUpdate({_id: newCollection._id}, {$push: {puzzle: collectionFrom.puzzle[i]}},{new: true},function (err,model){
                        if (err) {
                            console.log(err)
                        }
                        console.log('model', model)
                    })

                    // Copy problem from other users collection and add that to the users personalTracker (That will give the due date for when it is due.)
                    Collection.findById(newCollection._id)
                    .then(respons => {
                        console.log(respons)
                    })
                    
                    const body = {
                        origin: collectionFrom.puzzle[i].id,
                        collections: [newCollection.id], 
                        problem: collectionFrom.puzzle[i].problem,
                        answer: collectionFrom.puzzle[i].answer,
                        dueDate: Date.now(),
                        dayJumper: 0
                    }
                    const newTracker = await PersonalTracker.create(body)

                    // Add new personal tracker to the user.
                    userUpdated = await User.findByIdAndUpdate({_id: userId}, {$push: {personalTracker: newTracker.id}},{new: true})

                    User.findById(userId).populate('personalTracker')
                }
            }
        }
        else {
            res.render('user/accessDenied')
        }
    } 
    res.redirect('/user') 
})

// User Home Page
router.get('/', async (req, res) => {
    // Check if looged in or no point in this page other then display badlly. 
    if (req.session.loggedIn === true) {
        const userId = req.session.userId
        const user = await User.findById( userId )
        .populate('personalTracker')
        
        // Get user's Collection they own to display.
        Collection.find({owner: userId})
            .then (collection => {
                res.render('user/home', { user, collection})
            })
            .catch(error => {
                console.log(error)
                res.json({ error })
            })    
    } else {
        res.redirect('user/login')
    }
})

///////////////////////////////////////
// export our router
///////////////////////////////////////
module.exports = router