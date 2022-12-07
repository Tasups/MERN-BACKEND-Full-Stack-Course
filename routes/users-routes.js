const express = require('express')

const usersControllers = require('../controllers/users-controllers')

const router = express.Router()


// current filter app.js set to /api/users

router.get('/', usersControllers.getUsers)

router.post('/signup', usersControllers.signup)

router.post('/login', usersControllers.login)

module.exports = router