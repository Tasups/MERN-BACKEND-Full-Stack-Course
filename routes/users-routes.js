const express = require('express')
const { check } = require('express-validator')

const usersControllers = require('../controllers/users-controllers')
const fileUpload = require('../middleware/file-upload')

const router = express.Router()

// current filter app.js set to /api/users

router.get('/', usersControllers.getUsers)

router.post(
  "/signup",
  // this is the multer package grabbing a value by a key in the post request
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail(), // Example@example.com => example@example.com
    check("password").isLength({ min: 8 }),
  ],
  usersControllers.signup
);

router.post('/login', usersControllers.login)

module.exports = router