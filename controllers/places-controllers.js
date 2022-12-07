const randomId = require('../randomNum')
const HttpError = require('../models/http-error')

const DUMMY_PLACES = [
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
  }
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

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid
  const place = DUMMY_PLACES.find(p => {
    return p.creator === userId
  })
  if(!place){
    // return must be used here to cancel further function operations, throw does that on its own
    return next(new HttpError('Could not find a place with the provided user id.', 404))
    // next is used in asynchronous functions in express, which we will use due to accessing a DB
  }
  res.json({ place })
}

const createPlace = (req, res, next) => {
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
  const placeId = req.params.id
  DUMMY_PLACES.filter(p => p.id !== placeId)
  res.status(200).json({ message: 'Deleted place.'})
}

exports.getPlaceById = getPlaceById
exports.getPlaceByUserId = getPlaceByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
