const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid
  
  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(
      'Could not find place with that id in the database. Please try again later.', 
      500
      )
    return next(error)
  }

  if(!place){
    const error = new HttpError('Could not find place with that id.')
    return next(error)
  }
  
  res.json({ place: place.toObject({ getters: true }) })
}

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid
  
  let places
  // let userWithPlaces
  
  try {
    places = await Place.find({ creator: userId })
    // userWithPlaces = await User.findById(userId).populate('places')
  } catch (err) {
    const error = new HttpError(
      'Could not find places with that user id in the database. Please try again later.', 
      500
      )
    return next(error)
  }
  
  // if (!userWithPlaces || userWithPlaces.place.length === 0){...}
  if(!places || places.length === 0){
    const error = new HttpError('Could not find places with the provided user id.', 404)
    return next(error)
  }
  
  // res.json({ userWithPlaces.places: places.map(place => place.toObject({ getters: true })
  res.json({ places: places.map(place => place.toObject({ getters: true })) })
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(HttpError('Invalid inputs, please check your data ', 422))
  }

  const { title, description, address, creator } = req.body;

  let coordinates
  try {
     coordinates = await getCoordsForAddress(address);
  } catch(error) {
    return next(error)
  }

  const createdPlace = new Place({
    title, 
    description,
    address, 
    location: coordinates,
    image: 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fwww.nps.gov%2Fcommon%2Fuploads%2Fcropped_image%2Fprimary%2FF0CEDDA8-CDA3-A365-792FF3B0EB0FCFF8.jpg%3Fwidth%3D1600%26quality%3D90%26mode%3Dcrop&imgrefurl=https%3A%2F%2Fwww.nps.gov%2Fplaces%2Fwhite-house.htm&tbnid=KP3K336FPMuhbM&vet=12ahUKEwiZpcHT8Pn7AhV0QEIHHULdAo0QMygDegUIARDuAQ..i&docid=RWp2QPYrEHnUeM&w=1599&h=900&q=white%20house&ved=2ahUKEwiZpcHT8Pn7AhV0QEIHHULdAo0QMygDegUIARDuAQ',
    creator
  })
  
  let user
  
  try {
    user = await User.findById(creator)
  } catch (err) {
    const error = new HttpError('Could not create place. Please try again.', 500)
    return next(error)
  }
  
  if (!user) {
    const error = new HttpError('Could not find user with that id.', 404)
    return next(error)
  }
  
  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdPlace.save({ session: sess })
    user.places.push(createdPlace)
    await user.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError('Unable to create place.', 500)
    return next(error)
  }
  
  res.status(201).json({ place: createdPlace })
}

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid inputs, please check your data', 422)
    return next(error)
  }

  const { title, description } = req.body
  const placeId = req.params.pid
  
  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(
      'Could not find place with that id in the database. Please try again later.',
      500
      )
    return next(error)
  }
  
  place.title = title
  place.description = description
  
  try {
    await place.save()
  } catch (err) {
    const error = new HttpError('Could not save place. Please try again later.', 500)
    return next(error)
  }
  
  res.status(200).json({ place: place.toObject({ getters: true })})
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid
  
  let place
  try {
    place = await Place.findById(placeId).populate('creator')
  } catch (err) {
    const error = new HttpError(
      'Could not delete place. Please try again later.', 
      500
      )
    return next (error)
  }
  
  if (!place) {
    const error = new HttpError('Could not delete place with that id.', 404)
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await place.remove({ session: sess })
    place.creator.places.pull(place)
    await place.creator.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError(
      'Could not delete place. Please try again later.',
      500
      )
    return next(error)
  }
  
  res.status(200).json({ message: 'Deleted place.'})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace

/*
  NOTES
  
  RANDOM ID GENERATOR NOT USED ANYMORE - WE NOW USE MONGODB NATIVE ID GENERATOR
  const randomId = require('../randomNum')
  
  LINE 30 -- getters: true
  the below place.toObject method converts the Mongoose object to a vanilla JS object and getters
  being set to true allow the _id to be converted to just id

  const sess = await mongoose.startSession()
  we start a session to "bundle" actions that connect the place to the user and the user to the 
  place. Then we commitTransaction to "commit" the entire transaction at once.

  MONGOOSE METHODS
  user.places.push(createdPlace) uses the push method from mongoose which pushes only the place id

  the following "pull" removes the id from the user.places collection for that particular user
  
*/