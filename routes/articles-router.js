const articlesRouter = require('express').Router()
const { getArticle, getArticles, patchArticle } = require('../controllers/articles.controller')
const { getCommentsByArticleId, postComment } = require('../controllers/comments.controller')


articlesRouter.get('/', getArticles)

articlesRouter.get('/:article_id', getArticle)

articlesRouter.get('/:article_id/comments', getCommentsByArticleId)

articlesRouter.post('/:article_id/comments', postComment)

articlesRouter.patch('/:article_id', patchArticle)


module.exports = articlesRouter