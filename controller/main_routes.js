const express = require('express')
const router = express.Router()
const User = require('../models/user')
const PersonalTracker = require('../models/personal-tracker')

router.get('/', async (req, res) => {
     const user = await User.findById(req.session.userId)
     .populate('personalTracker')
     // console.log('user.personalTracker[2].problem: ', user.personalTracker[2].problem)
     res.render('main/home', {user})
})

router.get('/go', async (req, res) => {
     const user = await User.findById(req.session.userId)//.select('personalTracker')
     // .populate({path:'personalTracker', options: { sort: {duedate: 1}} })
     .populate('personalTracker').sort([['dueDate', -1]])

     const trackerArray = []

     // console.log("user in /go page. lenght", user.length)

     for (let i = 0; i < user.personalTracker.length; i++) {
          trackerArray.push(user.personalTracker[i])
     }
     trackerArray.sort((a, b) => {
          return a.dueDate - b.dueDate;
     })
     if(trackerArray[0]._id) {
          const trackerOne = trackerArray[0]._id
          console.log("user in /go page. trackerOne.id ", trackerOne)

          const dueProblem = await PersonalTracker.findById(trackerOne)
          console.log('nextPersonalTracker: ', dueProblem)


          res.render('main/active', {dueProblem})
     } else {
          res.redirect('/main')
     }
     
})

router.get('/:id/right', async (req, res) => {
     const id = req.params.id
     const tracker = await PersonalTracker.findById(id)

     tracker.dayJumper++ 
     tracker.dueDate = new Date(+new Date(tracker.dueDate) + tracker.dayJumper*24*60*60*1000)
     tracker.save();

     res.redirect('/main/go')
})

router.get('/:id/wrong', async (req, res) => {
     // const tracker = await PersonalTracker.findById(req.params.id)
     // console.log(PersonalTracker)
     const id = req.params.id
     const tracker = await PersonalTracker.findById(id)

     // console.log('personalTracker before edit in /wrong ', tracker)
     tracker.dueDate = Date.now() + (10*60000)
     tracker.dayJumper = 0
     tracker.save();
     console.log('personalTracker after edit in /wrong ', tracker)

     res.redirect('/main/go')
})

module.exports = router