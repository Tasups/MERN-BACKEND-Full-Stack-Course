const randomId = require('../randomNum')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const HttpError = require('../models/http-error')


const getUsers = async (req, res, next) => {
  let users
  try {
    // using the empty object and '-password' is called using protection and not exposing the password
    users = await User.find({}, '-password') 
  } catch (err) {
    const error = new HttpError('Cannot find users. Please try again later.', 500)
    return next(error)
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) })
}

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError("Invalid inputs, please check your data ", 422);
    return next(error)
  }

  const { name, email, password } = req.body
  
  let existingUser
  
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError('Signup failed, please try again.', 500)
    return next(error)
  }
  
  if (existingUser) {
    const error = new HttpError('User already exists. Please login instead.', 422)
    return next(error)
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError('Could not create user, please try again.',
      500)
    return next(error)
  }
  
  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: []
  })
  
  try {
    await createdUser.save()
  } catch (err) {
    const error = new HttpError('Signup failed. Please try again later.', 500)
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "totes_mcgoates_secret",
      { expiresIn: "1h" }
    )
  } catch (err) {
    const error = new HttpError('Signup failed. Please try again later.', 500)
    return next(error)
  }
  
  res.status(201).json({ userId: createdUser.id, email: createUser.email, token: token })
}

const login = async (req, res, next) => {
  const { email, password } = req.body
  
  let existingUser
  
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again.', 500)
    return next(error)
  }
  
  if (!existingUser) {
    const error = new HttpError('Invalid email or password.', 401)
    return next(error)
  }

  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError('Invalid password, please try again', 500)
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError('INvalid email or password.', 401)
    return next(error)
  }
  


  res.status(200).json({ message: 'Logged in.', user: existingUser.toObject({ getters: true}) })
}


exports.getUsers = getUsers
exports.signup = signup 
exports.login = login 