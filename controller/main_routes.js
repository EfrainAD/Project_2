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
     const user = await User.findById(req.session.userId)
     .populate('personalTracker')
     // console.log('user.personalTracker[2].problem: ', user.personalTracker[2].problem)

     console.log("This what should be passed to /go page. ", user.personalTracker[0])

     res.render('main/active', {user})
})

router.get('/:id/right', async (req, res) => {
     const tracker = await PersonalTracker.findById(req.params.id)
})

router.get('/:id/wrong', async (req, res) => {
     // const tracker = await PersonalTracker.findById(req.params.id)
     // console.log(PersonalTracker)
     const id = req.params.id
     const tracker = await PersonalTracker.findById(id)

     // nowDate = new Date.now()
     // inTen = nowDate.setDate(nowDate.getMinutes()+10)  
     
     // console.log('HI, in /wrong nowDate is ', nowDate)
     // console.log('HI, in /wrong nowDate is ', inTen)
     // console.log('HI, id before edit in /wrong ', id)
     console.log('personalTracker before edit in /wrong ', tracker)
     // tracker.dueDate = new Date( (Date.now()).getTime() + 10*60000);
     // tracker.dueDate = new Date(Date.now() + 10*60000);
     tracker.dueDate = Date.now() + 10*60000
     tracker.dayJumper = 0
     // I think I need this but I think .then not. Need test.
     tracker.save();
     console.log('personalTracker after edit in /wrong ', tracker)

     res.redirect('/main/go')
})

module.exports = router