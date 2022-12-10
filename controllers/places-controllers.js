const { validationResult } = require('express-validator')
const randomId = require('../randomNum')
const HttpError = require('../models/http-error')

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid
  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId
  })
  if(!place){
    throw new HttpError('Could not find a place with the provided place id.', 404)
    // throw is used in a synchronous function, however, due to using a DB, we won't be doing that
  }
  res.json({ place })
}

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid
  const places = DUMMY_PLACES.filter(p => {
    return p.creator === userId
  })
  if(!places || places.length === 0){
    // return must be used here to cancel further function operations, throw does that on its own
    return next(new HttpError('Could not find places with the provided user id.', 404))
    // next is used in asynchronous functions in express, which we will use due to accessing a DB
  }
  res.json({ places })
}

const createPlace = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs, please check your data ', 422)
  }
  // the below translates to this for each value in the object destructured: 
  // const title = req.body.title
  const { title, description, address, coordinates, creator } = req.body
  const createdPlace = {
    id: randomId(),
    title,
    description,
    address,
    location: coordinates,
    creator,
  }
  DUMMY_PLACES.push(createdPlace) // or unshift method
  
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
