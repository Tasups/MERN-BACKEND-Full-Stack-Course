const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const HttpError = require('./models/http-error')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

const app = express()

app.use(bodyParser.json())

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404)
  throw error
})

// express sees use functions with 4 arguments as special, as an error handler
app.use((error, req, res, next) => {
  if(res.headerSent){
    return next(error)
  }
  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error occured.' })
})

mongoose
  .connect('mongodb+srv://jason_at_work:oUj893yELxfaltNX@cluster0.zsy1t.mongodb.net/mern_db_test?retryWrites=true&w=majority')
  .then(() => {
    app.listen(8080)
  })
  .catch(err => {
    console.log(err)
  })
