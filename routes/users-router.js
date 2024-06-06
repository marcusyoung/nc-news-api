const usersRouter = require('express').Router()
const { getUsers, authoriseUser, createUser } = require('../controllers/users.controller')


usersRouter.get('/', getUsers)

usersRouter.post('/login', authoriseUser)

usersRouter.post('/signup', createUser)


module.exports = usersRouter
