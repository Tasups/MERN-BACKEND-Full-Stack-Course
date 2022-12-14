const axios = require('axios')
const HttpError = require('../models/http-error')

const API_KEY = "AIzaSyD6GaD54rWqC5d0Rj0iowjhaKqBRnrqtcI"

async function getCoordForAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  );

  const data = response.data

  if (!data || data.status === 'ZERO_RESULST') {
    const error = new HttpError('Could not find location for the address.', 422)
    throw error
  }

  const coordinates = data.results[0].geometry.location

  return coordinates
}

module.exports = getCoordForAddress

// DUMMY FUNCTION TO USE WITHOUT GOOGLE API
// async function getCoordForAddress(address) {
//   return {
//     lat: 40.7484,
//     long: 73.9857
//   }
// }
