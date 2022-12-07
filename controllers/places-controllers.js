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
  const createdPlace ={
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

exports.getPlaceById = getPlaceById
exports.getPlaceByUserId = getPlaceByUserId
exports.createPlace = createPlace