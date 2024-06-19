const usersRouter = require('express').Router()
const { getUsers, getUser, authoriseUser, createUser, logoutUser } = require('../controllers/users.controller')
const verifyToken = require('../middleware/authMiddleware')


usersRouter.get('/', getUsers)

usersRouter.get('/:username', verifyToken, getUser)

usersRouter.post('/logout', verifyToken, logoutUser)

usersRouter.post('/login', authoriseUser)

usersRouter.post('/signup', createUser)


module.exports = usersRouter
