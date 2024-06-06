const usersRouter = require('express').Router()
const { getUsers, authoriseUser } = require('../controllers/users.controller')


usersRouter.get('/', getUsers)

usersRouter.post('/login', authoriseUser)


module.exports = usersRouter
