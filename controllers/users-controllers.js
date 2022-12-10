const randomId = require('../randomNum')
const { validationResult } = require('express-validator')

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

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs, please check your data ", 422);
  }

  const { name, email, password } = req.body
  
  const userExists = DUMMY_USERS.find(u => u.email === email)
  
  if (userExists) {
    throw new HttpError('Email already exists. Please try again.', 422)
  }
  
  const createdUser = {
    id: randomId(),
    name,
    email,
    password 
  } 
  
  DUMMY_USERS.push(createdUser)
  res.status(201).json({ user: createdUser })
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