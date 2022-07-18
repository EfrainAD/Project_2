///////////////////////////////////////
// Import dependencies
///////////////////////////////////////
const express = require('express')
const User = require('../models/user')
const PersonalTracker = require('../models/personal-tracker')
const Collection = require('../models/collection')
const Puzzle = require('../models/personal-tracker')
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

router.post('/:collectionId', async (req, res) => {
    const collectionId = req.params.collectionId // Collection to get the problems
    const userId = req.session.userId               // User who requested
    const collectionToAdd = req.body.userCollection // Name of the collection to be made for the user if he already doesnt have it. //TODO: Need check later if that a good idea or laway make a new one regardless.

    // Make the collection if not exist. return Id
    // If it does exist, store the id. /////
    // console.log('Name of the collection to add is ', collectionToAdd)
    let puzzleCollectionId = await Collection.exists({owner: userId, name: collectionToAdd})//.lean()
    // console.log('Hi before the if', puzzleCollectionId)
    if (!puzzleCollectionId) {
        puzzleCollectionId = await Collection.create({owner: userId, name: collectionToAdd})
        // console.log('Hi in the if', puzzleCollectionId)
    } 
    // console.log('Hi after the if', puzzleCollectionId)

    // // This will find the collection the user wants to add the problems from.
    // // Make the a copy of them for the next step.
    Collection.findById(collectionId)
    .populate('owner')
    .populate('puzzle')
    .then(collection => {
        console.log('Hi Collection to get problems from ', collection)
        console.log('Hi Collection.puzzle to get problems from ', collection.puzzle)

        // Check if autherized to take these problems from this collection.
        // If so go through each problem and add it to the newly made collection.
        if ((collection.public == true) || (userId == collection.owner.id) ) {
        console.log('Passsed the public or owner check.')
            collection.puzzle.forEach(puzzle => {
                console.log('Hi, I am in the .forEatch loop of collection.')

                // To add the problem Id's to new collections
                // TODO: should only grab public puzzles.
                // PROBLEM: This does not seem to add to the new collection made for user.
                if (puzzle.public) {
                    console.log('HI I am inside my puzzle public test. PASS')
                    const temp = await Collection.findByIdAndUpdate(puzzleCollectionId, {$push:{puzzle: puzzle.id}}, {new: true})
                    console.log('HI This is temp, to show update ',temp)
                }
                // puzzle.exists({ puzzle: puzzle}, (err, doc) => {
                //     if (!doc) {
                //         console.log('HIHIEHIHIHIHIHIHIHI')
                //         const temp = Collection.findByIdAndUpdate(puzzleCollectionId, {$push:{puzzle: puzzle.id}}, {new: true})
                //         console.log('HI This si temp, to show update ',temp)
                //     }
                // })

                // Making an object for PersonalTracker model.
                const body = {
                    origin: puzzle.id,
                    collections: [puzzleCollectionId.id], //This not being a $push: could be a problem. // sinse this the first time made might be fine but I need check for posable bugs with this.
                    problem: puzzle.problem,
                    dueDate: Date.now(),
                    dayJumper: 0
                }
                console.log('Hi This is the body: ', body) 

                //Add to new tracker.
                // PROBLEM This does not $push: to users personal Tracker.
                PersonalTracker.create(body) 
                .then(trackedProblem => {
                    User.findByIdAndUpdate(userId, {$push:{personalTracker: trackedProblem}}, {new: true})
                    
                    //puzzleCollectionId.puzzle.push(trackedProblem)
                })
                    //Check to see if personalTracker is there.
                    // Because of how Prolmises work I am moving this out of here.
                    // Code was here moved to the user get route.
            })
            res.redirect('/user')
        } else {
            res.render('user/accessDenied')
        }
    })
    
})

router.get('/', async (req, res) => {
    const userId = req.session.userId
    const user = await User.findById( userId )
    .populate('personalTracker')

    User.findById(userId)
    // .populate('personalTracker')
    .then(user => {console.log('Hi user has this showing up as there personal collection. It should be there. ', user.personalTracker)})

    Collection.find({owner: userId})
        .then (collection => {
            res.render('user/home', { user, collection})
        })
        .catch(error => {
            console.log(error)
            res.json({ error })
        })    
})

///////////////////////////////////////
// export our router
///////////////////////////////////////
module.exports = router