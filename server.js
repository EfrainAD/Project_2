/////////////////////////////////
// import dependencies
/////////////////////////////////
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const methodOverride = require('method-override')
const mainRoutes = require('./controller/main_routes')
const usersRoutes = require('./controller/user_routes')
const collectionRoutes = require('./controller/collection_routes')
const puzzleRoutes = require('./controller/puzzle_routes')

////////////////////////////////////////////
// Create our express application object
////////////////////////////////////////////
const app = require('liquid-express-views')(express())

////////////////////////////////////////////
// Middleware
////////////////////////////////////////////
// this is for request logging
app.use(morgan('tiny'))
app.use(methodOverride('_method'))
// parses urlencoded request bodies
app.use(express.urlencoded({ extended: false }))
// to serve files from public statically
app.use(express.static('public'))
// bring in our session middleware
const session = require('express-session')
const MongoStore = require('connect-mongo')

// here's the middleware that sets up our sessions
app.use(
	session({
		secret: process.env.SECRET,
		store: MongoStore.create({
			// mongoUrl: process.env.DATABASE_URI
			mongoUrl: process.env.MONGODB_URI
		}),
		saveUninitialized: true,
		resave: false
	})
)

////////////////////////////////////////////
// Routes
////////////////////////////////////////////
app.use('/main', mainRoutes)
app.use('/user', usersRoutes)
app.use('/collection', collectionRoutes)
app.use('/puzzle', puzzleRoutes)

// localhost:8000/
app.get('/', (req, res) => {
	// res.send('your server is running, better go catch it <a href="/main">Go to Home Page</a>')
	res.redirect('/main')
})

////////////////////////////////////////////
// Server Listener
////////////////////////////////////////////
const PORT = process.env.PORT
app.listen(PORT || 3000, () => {
// app.listen(PORT, () => {
	console.log(`app is listening on port: ${PORT}`)
})
