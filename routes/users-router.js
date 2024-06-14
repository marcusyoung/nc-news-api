const usersRouter = require('express').Router()
const { getUsers, getUser, authoriseUser, createUser } = require('../controllers/users.controller')
const verifyToken = require('../middleware/authMiddleware')


usersRouter.get('/', getUsers)

usersRouter.get('/:username', verifyToken, getUser)

usersRouter.post('/login', authoriseUser)

usersRouter.post('/signup', createUser)


module.exports = usersRouter
