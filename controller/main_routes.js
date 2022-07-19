const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.get('/', async (req, res) => {
     const user = await User.findById(req.session.userId)
     .populate('personalTracker')
     // console.log('user.personalTracker[2].problem: ', user.personalTracker[2].problem)
     res.render('main/home', {user})
})

module.exports = router