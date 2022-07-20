const express = require('express')
const router = express.Router()
const User = require('../models/user')

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
     res.render('main/active', {user})
})

router.get('/:id/right', async (req, res) => {
     const tracker = await PersonalTracker.findById(req.params.id)
})

router.get('/:id/wrong', async (req, res) => {
     // const tracker = await PersonalTracker.findById(req.params.id)
     // console.log(PersonalTracker)
     const id = req.params.id
     User.find({'personalTracker._id': id}).populate('personalTracker')
     .then(user => {
          console.log('user ', user)
//     const address = user.addresses.id(addressId); // returns a matching subdocument
//     address.set(req.body); // updates the address while keeping its schema       
    // address.zipCode = req.body.zipCode; // individual fields can be set directly

//     return user.save();


     // console.log('personal tracker before edits: ', tracker)
     // tracker.dueDate = Date.now()
     // tracker.dayJumper = 0
     // console.log('personal tracker after edits: ', tracker)

          res.redirect('/main/go')
     })
})

module.exports = router