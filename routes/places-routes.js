const express = require('express')
const { check } = require('express-validator')

const placesControllers = require('../controllers/places-controllers')

const router = express.Router()


// current filter in app.js set to /api/places

router.get('/:pid', placesControllers.getPlaceById)

router.get('/user/:uid', placesControllers.getPlacesByUserId)

router.post('/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 8 }),
    check('address').not().isEmpty()
  ],
  placesControllers.createPlace
)

router.patch('/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 8})
  ],
  placesControllers.updatePlace
)

router.delete('/:pid', placesControllers.deletePlace)

module.exports = router