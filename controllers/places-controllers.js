const { validationResult } = require('express-validator')

const randomId = require('../randomNum')
const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'one of the most famous skyscrapers in the world',
    location: {
      lat: 40.7484,
      long: 73.9857
    },
    address: "20 W 34th St, New York, NY 10001", 
    creator: "u1"
  },
  {
    id: 'p2',
    title: 'Alcatraz',
    description: 'one of the most famous prisons in the world',
    location: {
      lat: 37.8269775,
      long: -122.4229555
    },
    address: "San Francisco, CA 94133", 
    creator: "u1"
  },
  {
    id: 'p3',
    title: "Peter's Basilica",
    description: 'one of the most famous churches in the world',
    location: {
      lat: 41.9021667,
      long: 12.4539367
    },
    address: "Piazza San Pietro, 00120 Città del Vaticano, Vatican City", 
    creator: "u1"
  },
]

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid
  
  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(
      'Could not find place with that id in the database. Please try again later', 
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
  try {
    places = await Place.find({ creator: userId })
  } catch (err) {
    const error = new HttpError(
      'Could not find places with that user id in the database. Please try again later.', 
      500
      )
    return next(error)
  }
  
  if(!places || places.length === 0){
    const error = new HttpError('Could not find places with the provided user id.', 404)
    // return must be used here to cancel further function operations, throw does that on its own
    return next(error)
    // next is used in asynchronous functions in express, which we will use due to accessing a DB
  }
  res.json({ places: places.map(place => place.toObject({ getters: true })) })
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(HttpError('Invalid inputs, please check your data ', 422))
  }
  // the below translates to this for each value in the object destructured: 
  // const title = req.body.title
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
  
  try {
    await createdPlace.save()
  } catch (err) {
    const error = new HttpError('Unable to create place.', 500)
    return next(error)
  }
  
  res.status(201).json({ place: createdPlace })
}

const updatePlace = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // you can console.log(errors) to get more information on the errors
    throw new HttpError('Invalid inputs, please check your data', 422)
  }

  const { title, description } = req.body
  const placeId = req.params.pid
  
  const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId)}
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
  updatedPlace.title = title
  updatedPlace.description = description
  
  DUMMY_PLACES[placeIndex] = updatedPlace
  res.status(200).json({ place: updatedPlace})
}

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid
  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Cannot find a place with that id.', 404)
  }
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)
  res.status(200).json({ message: 'Deleted place.'})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
