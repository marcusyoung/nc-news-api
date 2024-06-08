const articlesRouter = require('express').Router()
const { getArticle, getArticles, patchArticle } = require('../controllers/articles.controller')
const { getCommentsByArticleId, postComment } = require('../controllers/comments.controller')
const verifyToken = require('../middleware/authMiddleware')

articlesRouter.get('/', getArticles)

articlesRouter.get('/:article_id', getArticle)

articlesRouter.get('/:article_id/comments', getCommentsByArticleId)

// must have a valid token to post a comment
// router.get(<insert path here>, <insert middleware here>, <insert handler here>)
articlesRouter.post('/:article_id/comments', verifyToken, postComment)

// must have a valid token to vote for an article
articlesRouter.patch('/:article_id', verifyToken, patchArticle)


module.exports = articlesRouter