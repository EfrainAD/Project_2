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

// router.post('/:collectionId', async (req, res) => {
//     const puzzleSourceCollection = req.params.collectionId // Collection to get the problems
//     const userId = req.session.userId               // User who requested
//     const newCollectionName = req.body.userCollection // Name of the collection to be made for the user if he already doesnt have it. //TODO: Need check later if that a good idea or laway make a new one regardless.

//     // Make the collection if not exist. return Id
//     // If it does exist, store the id. /////
//     // console.log('Name of the collection to add is ', newCollectionName)
//     const newCollectionIfExists = await Collection.exists({owner: userId, name: newCollectionName})//.lean()
//    console.log('Hi//////////// before the if', newCollectionIfExists)
//    let newCollection = null
//     if (!newCollectionIfExists) {
//         newCollection = await Collection.create({owner: userId, name: newCollectionName})
//         // console.log('Hi in the if', newCollection)
//     } 
     
//     // console.log('Hi after the if', newCollection)

//     // // This will find the collection the user wants to add the problems from.
//     // // Make the a copy of them for the next step.
//     const collectionFrom = await Collection.findById(puzzleSourceCollection)
//     .populate('owner')
//     .populate('puzzle')

//     console.log('Hi Collection to get problems from ', collectionFrom)
//     console.log('Hi Collection.puzzle to get problems from ', collectionFrom.puzzle)

//     // Check if autherized to take these problems from this collection.
//     // If so go through each problem and add it to the newly made collection.
//     if ((collectionFrom.public == true) || (userId == collectionFrom.owner.id) ) {
//         console.log('Passsed the public or owner check.')
        
//         console.log('collectionFrom.puzzle.length = ', collectionFrom.puzzle.length)
//         for (let i = 0; i < collectionFrom.puzzle.length; i++) {
//             console.log('Hi, I am in the for loop of FrocollectionFrom.')

//             // To add the problem Id's to new collections
//             // TODO: should only grab public puzzles.
//             // PROBLEM: This does not seem to add to the new FrocollectionFrom made for user. 
//             // console.count()
//             console.log('collectionFrom.puzzle.public = ', collectionFrom.puzzle[i].public)
//             if (collectionFrom.puzzle[i].public) {
//                 console.log('HI I am inside my puzzle public test. PASS')
                
//                 //Add puzzle to the new collection that was made.
//                 console.log("HIHIHIHIHIHi the newCollection I am trying to add the puzzle to is, ", newCollection.id)
//                 console.log("HI the collectionFrom.puzzle[i] I am trying to add is, ", collectionFrom.puzzle[i])
                
//                 // TRY ONE
//                 // Collection.findByIdAndUpdate(newCollection, {$push:{puzzle: collectionFrom.puzzle[i]}}, {new: true})
//                 // TRY TWO
//                 // Collection.findById(newCollection)
//                 // .then(collection => {
//                 //     collection.puzzle.push(collectionFrom.puzzle[i])
//                 // })
//                 // TRY THREE
//                 // const changedNewCollection = await Collection.findById(newCollection)
//                 // changedNewCollection.puzzle.push(collectionFrom.puzzle[i])
//                 // TRY FOUR
//                 // const changedNewCollection = await Collection.findByIdAndUpdate(newCollection, {$push:{puzzle: collectionFrom.puzzle[i]}}, {new: true})
//                 // TRY FIVE
//                 // Collection.findById(newCollection)
//                 // .then(collection => {
//                 //     collection.puzzle = collectionFrom.puzzle[i]
//                 // })
//                 // TRY SIX
//                 //  const changedNewCollection = await Collection.findById(newCollection)
//                 // changedNewCollection.puzzle = collectionFrom.puzzle[i]
//                 // TRY SEVEN
//                 // Collection.findByIdAndUpdate(newCollection, {$push:{puzzle: [collectionFrom.puzzle[i]]}}, {new: true})
//                 // TRY EIGHT
//                 // Collection.findByIdAndUpdate(newCollection, {$push:{puzzle: [collectionFrom.puzzle[i]._id]}}, {new: true})
//                 // TRY NINE
//                 // const somethingtemp = await Collection.findByIdAndUpdate(newCollection.id, {$push:{puzzle: [collectionFrom.puzzle[i].id]}}, {new: true})
//                 // const somethingtemp = await Collection.findByIdAndUpdate(newCollection.id, {$push:{puzzle: ['62d49096818c3a7e76a1eaca']}}, {new: true})
//                 // newCollection.updateOne($push:{puzzle: ['62d49096818c3a7e76a1eaca']})

//                 // const puzzleBody = {
//                 //     owner: userId,
//                 //     problem: collectionFrom.puzzle[i].problem
//                 // }
//                 const somethingtemp = await Collection.findOne({_id: newCollection.id})
//                 // somethingtemp.puzzle.push(collectionFrom.puzzle[i].id)
//                  somethingtemp.puzzle.push(collectionFrom.puzzle[i].id)
//                 somethingtemp.save()
//                 console.log('HI THIS IS SOMETHINGTEMP', somethingtemp)
//                 // Collection.updateOne({_id: newCollection.id}, {$push:{puzzle: [collectionFrom.puzzle[i]]}}, function (err, doc) {
//                 //     if (err) console.log(err)
//                 //     else {
//                 //         console.log('doc: ', doc) 
//                 //         doc.save()}
//                 // })
                
//                 // const updatedCollection = await Collection.findByIdAndUpdate(collectionId,{$push: {puzzle: [newPuzzle.id]}}, {new: true})
//                 // TRY TEN
//                 // console.log('', newCollection.) // _.id kills
//                 // Collection.findByIdAndUpdate(newCollection._id, {$push:{puzzle: [collectionFrom.puzzle[i].id]}}, {new: true})
                
//                 console.log("HI after the findByIdAndUpdate my collection looks like this (newCollection), ", newCollection)

//                 //console.log('HI This is temp, to show update ',temp)
                
//                 // Making an object for PersonalTracker model.
//                 const body = {
//                     origin: collectionFrom.puzzle[i].id,
//                     collections: [newCollection.id], //This not being a $push: could be a problem. // sinse this the first time made might be fine but I need check for posable bugs with this.
//                     problem: collectionFrom.puzzle[i].problem,
//                     dueDate: Date.now(),
//                     dayJumper: 0
//                 }
//                 console.log('Hi This is the body used to create the personal tracker: ', body) 
//                 // const personalTracker = await PersonalTracker.create(body) 
                
//                 //Add the new tracker.
//                 // TRY ONE
//                 // User.findByIdAndUpdate(userId, {$push:{personalTracker: body}}, {new: true})
//                 // TRY TWO
//                 const user = await User.findById(userId).populate('personalTracker')
//                 user.personalTracker.push(body)
//                 user.save()
//                 // console.log('HI user: ', user)
//             }
//         }
//         //Check to see if personalTracker is there.
//         // Because of how Prolmises work I am moving this out of here.
//         // Code was here moved to the user get route.
//     }
//     else {
//         res.render('user/accessDenied')
//     }
//     res.redirect('/user') 
// })

router.post('/:collectionId', async (req, res) => {
    const puzzleSourceCollection = req.params.collectionId // Collection to get the problems
    const userId = req.session.userId               // User who requested
    const newCollectionName = req.body.userCollection // Name of the collection to be made for the user if he already doesnt have it. //TODO: Need check later if that a good idea or laway make a new one regardless.
    const collectionIfExists = await Collection.findOne({owner: userId, name: newCollectionName})//.lean()
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    console.log(collectionIfExists)
    if (!collectionIfExists) { // if collection wasn't found, will be null. Do this stuff.
        const newCollection = await Collection.create({owner: userId, name: newCollectionName})
        const collectionFrom = await Collection.findById(puzzleSourceCollection)
        .populate('owner')
        .populate('puzzle')
        console.log('-------------------------------------------------------',
        collectionFrom.puzzle)
        if ((collectionFrom.public === true) || (userId == collectionFrom.owner.id) ) {
            console.log('************************************')
            for (let i = 0; i < collectionFrom.puzzle.length; i++) {
                console.log('public?',collectionFrom.puzzle[i].public)
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
                    
                    console.log('==============================\nollectionFrom.puzzle[i]', collectionFrom.puzzle[i]) 
                    const body = {
                        origin: collectionFrom.puzzle[i].id,
                        collections: [newCollection.id], //This not being a $push: could be a problem. // sinse this the first time made might be fine but I need check for posable bugs with this.
                        problem: collectionFrom.puzzle[i].problem,
                        dueDate: Date.now(),
                        dayJumper: 0
                    }
                    const newTracker = await PersonalTracker.create(body)
                    
                    console.log('newTracker: ', newTracker)

                    userUpdated = await User.findByIdAndUpdate({_id: userId}, {$push: {personalTracker: newTracker.id}},{new: true})

                    User.findById(userId).populate('personalTracker')
                    .then(user => {
                        console.log('update after newTracker: ', user)
                    })
                    
                    // , function (err, model){
                    //     if (err) {
                    //         console.log(err)
                    //     }
                    //     console.log('update after newTracker: ', model)
                    // })
                    // newTrackerr.findById(userId).populate('personalTracker')
                    // user.personalTracker.push(body)
                    // user.save()
                    

                }
            }
            //Check to see if personalTracker is there.
            // Because of how Prolmises work I am moving this out of here.
            // Code was here moved to the user get route.
        }
        else {
            res.render('user/accessDenied')
        }

    } 
    res.redirect('/user') 
})

router.get('/', async (req, res) => {
    const userId = req.session.userId
    const user = await User.findById( userId )
    .populate('personalTracker')
    // console.log('Hi user has this showing up as there personal Tracker. It should be there. ', user.personalTracker)


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