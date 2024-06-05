const usersRouter = require('express').Router()
const { getUsers, authoriseUser } = require('../controllers/users.controller')


usersRouter.get('/', getUsers)

usersRouter.post('/auth/:username/:password', authoriseUser)


module.exports = usersRouter
