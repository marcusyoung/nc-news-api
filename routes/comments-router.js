const commentsRouter = require('express').Router()
const { removeComment } = require('../controllers/comments.controller')
const verifyToken = require('../middleware/authMiddleware')

commentsRouter.delete('/:comment_id', verifyToken, removeComment)

module.exports = commentsRouter