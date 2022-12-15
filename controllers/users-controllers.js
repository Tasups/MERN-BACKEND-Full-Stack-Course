const randomId = require('../randomNum')
const { validationResult } = require('express-validator')

const User = require('../models/user')
const HttpError = require('../models/http-error')

const DUMMY_USERS = [
    {
      id: 'u1',
      name: 'Jason Whisnant',
      email: 'tasups@gmail.com',
      password: 'testpassword'
    },
    {
      id: 'u2',
      name: 'Duncan McLeod',
      email: 'dunleod@gmail.com',
      password: 'duncandonuts'
    },
    {
      id: 'u3',
      name: 'Dolly Parton',
      email: 'goat@hotmail.com',
      password: 'dollpart'
    },
  ]


const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS })
}

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError("Invalid inputs, please check your data ", 422);
    return next(error)
  }

  const { name, email, password, places } = req.body
  
  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again.', 500)
    return next(error)
  }
  
  if (existingUser) {
    const error = new HttpError('User exists already. Please login instead.', 422)
    return next(error)
  }
  
  const createdUser = new User({
    name,
    email,
    password,
    image: 'https://github.com/Tasups/MERN-Full-Stack-Course/blob/main/react-frontend-01-starting-setup/src/images/andrea_piacquadio.jpg?raw=true',
    places
  })
  
  try {
    await createdUser.save()
  } catch (err) {
    const error = new HttpError('Signup failed. Please try again later.', 500)
    return next(error)
  }
  
  res.status(201).json({ user: createdUser.toObject({ getters: true }) })
}

const login = (req, res, next) => {
  const { email, password } = req.body
  
  const authenticatedUser = DUMMY_USERS.find(u => u.email === email)
  if (!authenticatedUser) {
    throw new HttpError('User not identified.', 401)
  }
  if (authenticatedUser.password !== password) {
    throw new HttpError('Incorrect password, please try again.', 401)
  }
  
  res.status(200).json({ message: 'Logged in.' })
}


exports.getUsers = getUsers
exports.signup = signup 
exports.login = login 