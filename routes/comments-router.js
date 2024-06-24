const commentsRouter = require('express').Router()
const { removeComment, patchComment } = require('../controllers/comments.controller')
const verifyToken = require('../middleware/authMiddleware')

commentsRouter.delete('/:comment_id', verifyToken, removeComment)

commentsRouter.patch('/:comment_id', verifyToken, patchComment)

module.exports = commentsRouter