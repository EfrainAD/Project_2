const express = require('express')
const router = express.Router()
const User = require('../models/user')
const PersonalTracker = require('../models/personal-tracker')
const { Collection } = require('mongoose')
const Puzzle = require('../models/puzzle')

// Home page with how many problems due.
// Get's user Personal Tracker through user account.
router.get('/', async (req, res) => {
     const loggedIn = req.session.loggedIn
     const user = await User.findById(req.session.userId)
     .populate('personalTracker')
     
     res.render('main/home', {user, loggedIn})
})

// When you are going through the problems you're studing
router.get('/go', async (req, res) => {
     const loggedIn = req.session.loggedIn
     const user = await User.findById(req.session.userId)
     .populate('personalTracker') //.sort([['dueDate', -1]]) // Not work

     // Need to grab the personal tracker with the early due date
     // TODO Clean Up. This should be more simple
     const trackerArray = []
     for (let i = 0; i < user.personalTracker.length; i++) {
          trackerArray.push(user.personalTracker[i])
     }
     trackerArray.sort((a, b) => { 
          return a.dueDate - b.dueDate;
     })
     // If stament to pervent a crash if you have no personal tracker.
     // grabs the first one becuase you only use one at a time.
     if(trackerArray[0]?._id) {
          const trackerOne = trackerArray[0]._id

          const dueProblem = await PersonalTracker.findById(trackerOne)
          console.log('nextPersonalTracker: ', dueProblem)

          res.render('main/active', {dueProblem, loggedIn})
     } else {
          res.redirect('/main')
     }
     
})

// What happens when you clicked it right.
router.get('/:id/right', async (req, res) => {
     const id = req.params.id
     const tracker = await PersonalTracker.findById(id)

     // Change the next due date to something longer.
     // line 52,  convert day into ms then adds to dueDate to add that many days.
     tracker.dayJumper++ 
     tracker.dueDate = new Date(+new Date(tracker.dueDate) + tracker.dayJumper*24*60*60*1000)
     tracker.save();

     res.redirect('/main/go')
})

// What happens when you clicked it wrong.
router.get('/:id/wrong', async (req, res) => {
     const id = req.params.id
     const tracker = await PersonalTracker.findById(id)

     // set's due date to 10min later. resets when you will see your problem varible back to the starting point.
     tracker.dueDate = Date.now() + (10*60000)
     tracker.dayJumper = 0
     tracker.save();

     res.redirect('/main/go')
})

//Page: Edit forum
router.get('/:trackerId/edit', (req, res) => {
     const trackerId = req.params.trackerId
     const ownerId = req.session.userId
     
     Puzzle.findById(trackerId)
     .then(puzzle => {
         if (trackerId == puzzle.owner.id) {
             res.render('puzzle/edit', {puzzle})
         } else {
             res.render('user/accessDenied')
         }
     })
 })

// Show page for personal tracker as well as options
router.get('/:id', async (req, res) => {
     const trackerId = req.params.id

     // Get the Personal tracker
     const tracker = await PersonalTracker.findById(trackerId)
     .populate('origin') // This is the puzzle_id. I need this to get the owner of it so I can display the owner name of the problem.)
     .populate('collections') // This will be used to display the collection the problem belongs to.

     // Getting "origin" so I can .poplulate again to get the owner's username of the puzzle.
     const puzzle = await Puzzle.findById(tracker.origin)
     .populate('owner')
     const username = puzzle.owner.username

     res.render('main/show', {tracker, username})
})

// DELETE - Delete a problem due, but not the problem it's self.
router.delete('/delete/:id', (req, res) => {
     const trackerId = req.params.id
 
     PersonalTracker.findByIdAndRemove(trackerId)
     .then(tracker => {
         res.redirect('/user')
     })
})

module.exports = router