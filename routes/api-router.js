const apiRouter = require('express').Router()
const articlesRouter = require('./articles-router')
const usersRouter = require('./users-router')
const commentsRouter = require('./comments-router')
const topicsRouter = require('./topics-router')
const endpoints = require('../endpoints.json')

apiRouter.get('/', (req, res) => {
    res.status(200).send('API Router is OK')
})

apiRouter.get('/api', (req, res) => {
    res.status(200).send({ endpoints: endpoints })
})

apiRouter.use('/api/articles', articlesRouter)
apiRouter.use('/api/users', usersRouter)
apiRouter.use('/api/comments', commentsRouter)
apiRouter.use('/api/topics', topicsRouter)

module.exports = apiRouter